import { Context } from './context';
import { createFetch, ErrorFactory, FetchError } from './fetch';

/**
 * Fine-grained access tokens (ADR-0068). The shapes below are written from the
 * request and response schemas of the `/tokens*` routes and `GET /audit/events`
 * of token-service. The server validates every policy; nothing here does.
 */

export type AccessTokenStatus = 'active' | 'disabled';
export type AccessTokenEnforcement = 'enforce' | 'audit';
export type AccessTokenAuditLevel = 'default' | 'full';

export interface PolicyStatement {
  actions: string[];
  resources: string[];
}

export interface TokenPolicy {
  version: 1;
  statements: PolicyStatement[];
}

export interface AccessToken {
  patId: string;
  tenantId: string;
  userId: string;
  name: string;
  description: string;
  status: AccessTokenStatus;
  policy: TokenPolicy;
  policyVersion: number;
  enforcement: AccessTokenEnforcement;
  auditLevel: AccessTokenAuditLevel;
  /** ISO-8601 UTC, present while auditLevel is full */
  auditUntil?: string;
  /** ISO-8601 UTC */
  lastUsedAt?: string;
  /** ISO-8601 UTC */
  createdAt: string;
  createdBy: string;
  /** Expiry as seconds since the epoch. Fixed at creation. */
  exp: number;
}

/** The response of createAccessToken: the record plus the token value, returned once. */
export interface CreatedAccessToken extends AccessToken {
  token: string;
}

export interface CreateAccessTokenBody {
  name: string;
  description?: string;
  /** One of template and policy is required */
  template?: string;
  policy?: TokenPolicy;
  /** Integer, 60 to 90 days. The server default is 90 days. */
  expiresInSeconds?: number;
  enforcement?: AccessTokenEnforcement;
  auditLevel?: AccessTokenAuditLevel;
  /** 1 to 168, requires auditLevel full */
  auditHours?: number;
}

/** The fields PATCH /tokens/{id} accepts. There is no `exp`: it cannot change. */
export interface AccessTokenPatch {
  name?: string;
  description?: string;
  status?: AccessTokenStatus;
  enforcement?: AccessTokenEnforcement;
  auditLevel?: AccessTokenAuditLevel;
  /** 1 to 168, requires auditLevel full */
  auditHours?: number;
}

export interface ListAccessTokensOptions {
  /** 1 to 200, the server default is 50 */
  limit?: number;
  /** The `next` of a previous page, passed through unchanged */
  after?: string;
}

export interface AccessTokenPage {
  items: AccessToken[];
  /** tenant for an owner or admin, own for a member */
  scope: 'tenant' | 'own';
  next?: string;
  /** Present when the workspace role could not be resolved and the list may be incomplete */
  roleLookup?: 'unavailable';
}

export interface SimulateAccessTokenResult {
  allowed: boolean;
  /** For example no_matching_statement or token_disabled */
  reason?: string;
}

export interface AuditEvent {
  eventId: string;
  /** ISO-8601 UTC */
  ts: string;
  tenantId?: string;
  userId?: string;
  patId?: string;
  tokenType?: 'pat' | 'fgt' | 'oauth';
  actor?: string;
  service?: string;
  requestId?: string;
  kind: string;
  action?: string;
  resource?: string;
  decision?: 'allow' | 'deny';
  reason?: string;
  policyVersion?: number;
  sourceIp?: string;
  userAgent?: string;
  method?: string;
  routeTemplate?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  count?: number;
  firstTs?: string;
  lastTs?: string;
}

export interface AuditFilter {
  /** The token id */
  patId?: string;
  userId?: string;
  kind?: string;
  action?: string;
  decision?: 'allow' | 'deny';
  /** ISO-8601 UTC, inclusive */
  from?: string;
  /** ISO-8601 UTC, inclusive */
  to?: string;
  /** 1 to 500, the server default is 100 */
  limit?: number;
}

export interface AuditEventsPage {
  /** Newest first */
  items: AuditEvent[];
  scope: 'tenant' | 'own';
  /** Opaque cursor of the next page */
  next?: string;
  roleLookup?: 'unavailable';
}

export interface AuditEventsOptions {
  /** Send export=true, which records one audit.exported event per page */
  export?: boolean;
}

/**
 * Error factory of this module. Keeps the server's `code` next to its
 * `reason` in the message (for example `insufficient_scope`), which the
 * default factory drops. `FetchError` and the default factory are unchanged.
 */
export const accessTokenErrorFactory: ErrorFactory = async (response) => {
  if (response.headers.get('content-type')?.includes('application/json')) {
    const res = (await response.json()) as {
      message?: string;
      reason?: string;
      code?: unknown;
    } | null;
    const text: string = res?.message ?? res?.reason ?? JSON.stringify(res);
    const code: unknown = res?.code;
    const message =
      typeof code === 'string' && code.length > 0 && !text.includes(code)
        ? `${text} (${code})`
        : text;
    return new FetchError({ message, httpCode: response.status });
  }
  return new FetchError({
    message: await response.text(),
    httpCode: response.status
  });
};

function baseUrl(ctx: Context): string {
  return `https://token.svc.${ctx.getPlatformEnvironment()}.osaas.io`;
}

function readHeaders(ctx: Context): Record<string, string> {
  return { 'x-pat-jwt': `Bearer ${ctx.getPersonalAccessToken()}` };
}

function jsonHeaders(ctx: Context): Record<string, string> {
  return { ...readHeaders(ctx), 'Content-Type': 'application/json' };
}

function tokenUrl(ctx: Context, id: string, suffix = ''): URL {
  return new URL(`/tokens/${encodeURIComponent(id)}${suffix}`, baseUrl(ctx));
}

/**
 * List one page of access tokens. Follow `next` (pass it as `after`) for more.
 * @memberof module:@osaas/client-core
 * @param {Context} ctx - Open Source Cloud configuration context
 * @param {ListAccessTokensOptions} [opts] - Page size and cursor
 */
export async function listAccessTokens(
  ctx: Context,
  opts?: ListAccessTokensOptions
): Promise<AccessTokenPage> {
  const url = new URL('/tokens', baseUrl(ctx));
  if (opts?.limit !== undefined) {
    url.searchParams.set('limit', String(opts.limit));
  }
  if (opts?.after) {
    url.searchParams.set('after', opts.after);
  }
  return createFetch<AccessTokenPage>(
    url,
    { method: 'GET', headers: readHeaders(ctx) },
    accessTokenErrorFactory
  );
}

/**
 * Get one access token record.
 * @memberof module:@osaas/client-core
 */
export async function getAccessToken(
  ctx: Context,
  id: string
): Promise<AccessToken> {
  return createFetch<AccessToken>(
    tokenUrl(ctx, id),
    { method: 'GET', headers: readHeaders(ctx) },
    accessTokenErrorFactory
  );
}

/**
 * Create an access token from a template or a policy. The response carries the
 * token value, which is returned once and cannot be retrieved again.
 * @memberof module:@osaas/client-core
 */
export async function createAccessToken(
  ctx: Context,
  body: CreateAccessTokenBody
): Promise<CreatedAccessToken> {
  return createFetch<CreatedAccessToken>(
    new URL('/tokens', baseUrl(ctx)),
    { method: 'POST', headers: jsonHeaders(ctx), body: JSON.stringify(body) },
    accessTokenErrorFactory
  );
}

/**
 * Replace the policy of a token (same token, new scope). Fails with a 409
 * FetchError when `expectedVersion` is not the current policyVersion.
 * @memberof module:@osaas/client-core
 */
export async function replaceAccessTokenPolicy(
  ctx: Context,
  id: string,
  policy: TokenPolicy,
  expectedVersion: number
): Promise<AccessToken> {
  return createFetch<AccessToken>(
    tokenUrl(ctx, id, '/policy'),
    {
      method: 'PUT',
      headers: jsonHeaders(ctx),
      body: JSON.stringify({ policy, expectedVersion })
    },
    accessTokenErrorFactory
  );
}

/**
 * Change name, description, status, enforcement or audit level of a token.
 * The expiry cannot be changed.
 * @memberof module:@osaas/client-core
 */
export async function updateAccessToken(
  ctx: Context,
  id: string,
  patch: AccessTokenPatch
): Promise<AccessToken> {
  return createFetch<AccessToken>(
    tokenUrl(ctx, id),
    { method: 'PATCH', headers: jsonHeaders(ctx), body: JSON.stringify(patch) },
    accessTokenErrorFactory
  );
}

/**
 * Delete a token record and revoke the token.
 * @memberof module:@osaas/client-core
 */
export async function deleteAccessToken(
  ctx: Context,
  id: string
): Promise<void> {
  // No Content-Type on DELETE: Fastify rejects an empty JSON body.
  await createFetch<unknown>(
    tokenUrl(ctx, id),
    { method: 'DELETE', headers: readHeaders(ctx) },
    accessTokenErrorFactory
  );
}

/**
 * Dry-run: would `action` on `resource` be allowed by the token's policy?
 * @memberof module:@osaas/client-core
 */
export async function simulateAccessToken(
  ctx: Context,
  id: string,
  action: string,
  resource: string
): Promise<SimulateAccessTokenResult> {
  return createFetch<SimulateAccessTokenResult>(
    tokenUrl(ctx, id, '/simulate'),
    {
      method: 'POST',
      headers: jsonHeaders(ctx),
      body: JSON.stringify({ action, resource })
    },
    accessTokenErrorFactory
  );
}

/**
 * Read one page of audit events, newest first.
 * @memberof module:@osaas/client-core
 * @param {Context} ctx - Open Source Cloud configuration context
 * @param {AuditFilter} filter - Filters, window and page size
 * @param {string} [cursor] - The `next` of a previous page, passed through unchanged
 * @param {AuditEventsOptions} [opts] - `export: true` sends export=true
 */
export async function listAuditEvents(
  ctx: Context,
  filter: AuditFilter,
  cursor?: string,
  opts?: AuditEventsOptions
): Promise<AuditEventsPage> {
  const url = new URL('/audit/events', baseUrl(ctx));
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }
  if (opts?.export) {
    url.searchParams.set('export', 'true');
  }
  return createFetch<AuditEventsPage>(
    url,
    { method: 'GET', headers: readHeaders(ctx) },
    accessTokenErrorFactory
  );
}

/**
 * Iterate the pages of an audit read. With `export` every page is requested
 * with export=true and the server records one audit.exported event per page.
 * The cursor of each page is passed back unchanged.
 * @memberof module:@osaas/client-core
 */
export async function* iterateAuditEvents(
  ctx: Context,
  filter: AuditFilter,
  opts?: AuditEventsOptions
): AsyncGenerator<AuditEventsPage, void, undefined> {
  let cursor: string | undefined;
  do {
    const page = await listAuditEvents(ctx, filter, cursor, opts);
    yield page;
    cursor = page.next;
  } while (cursor);
}
