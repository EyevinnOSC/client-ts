import { AuditEvent } from '@osaas/client-core';

/** ADR-0068 decision 7: the event fields, in ADR order. */
export const AUDIT_CSV_COLUMNS = [
  'eventId',
  'ts',
  'tenantId',
  'userId',
  'patId',
  'tokenType',
  'actor',
  'service',
  'requestId',
  'kind',
  'action',
  'resource',
  'decision',
  'reason',
  'policyVersion',
  'sourceIp',
  'userAgent',
  'method',
  'routeTemplate',
  'statusCode',
  'details',
  'count',
  'firstTs',
  'lastTs'
] as const;

/** ADR-0068 decision 8: one export is a range of at most 31 days. */
export const MAX_WINDOW_MS = 31 * 24 * 3600 * 1000;
/** ADR-0068 decision 8: and at most 500,000 events. */
export const MAX_EXPORT_ROWS = 500000;

/**
 * RFC 4180: quote a field that holds a comma, a quote or a line break.
 * A string that starts with = + - @ tab or CR would run as a formula in a
 * spreadsheet, so it gets a leading single quote and is always quoted. This is
 * a deliberate deviation from a literal "flat CSV"; NDJSON stays unmodified.
 */
export function csvField(value: unknown): string {
  if (value === undefined || value === null) return '';
  const text = typeof value === 'string' ? value : String(value);
  const isNumber = typeof value === 'number' && Number.isFinite(value);
  // Test the final text (any non-number, however it became a string), also
  // after leading whitespace, and include the fullwidth look-alikes.
  const formula =
    !isNumber && /^[\t\r]|^\s*[=+\-@|\uFF1D\uFF0B\uFF0D\uFF20]/.test(text);
  const out = formula ? `'${text}` : text;
  return formula || /[",\r\n]/.test(out) ? `"${out.replace(/"/g, '""')}"` : out;
}

export function csvHeader(): string {
  return AUDIT_CSV_COLUMNS.join(',') + '\r\n';
}

/** One CSV record. `details` is written as a JSON string. */
export function csvRow(event: AuditEvent): string {
  const record = event as unknown as Record<string, unknown>;
  return (
    AUDIT_CSV_COLUMNS.map((column) => {
      const value = record[column];
      if (column === 'details') {
        return csvField(value === undefined ? '' : JSON.stringify(value));
      }
      return csvField(value);
    }).join(',') + '\r\n'
  );
}

export interface ExportWindow {
  from: string;
  to: string;
}

/**
 * Split [from, to] into consecutive windows of at most 31 days, newest first,
 * so the output stays newest first across windows. The server treats both ends
 * as inclusive, so the next window ends one millisecond before the previous
 * one starts and no event can be read twice.
 */
export function splitWindows(fromMs: number, toMs: number): ExportWindow[] {
  const windows: ExportWindow[] = [];
  let end = toMs;
  while (end >= fromMs) {
    const start = Math.max(fromMs, end - MAX_WINDOW_MS);
    windows.push({
      from: new Date(start).toISOString(),
      to: new Date(end).toISOString()
    });
    end = start - 1;
  }
  return windows;
}
