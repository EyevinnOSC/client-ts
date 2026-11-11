import { Context } from './context';
import { createFetch } from './fetch';

/**
 * One recorded lifecycle event of a service instance. Enumerated fields are
 * typed as string so that new values added by the platform do not break
 * existing clients.
 */
export interface InstanceEvent {
  id: string;
  /** For example create, restart, update, suspend, resume, delete, replace, crash, oom, evict */
  type: string;
  /** user, service, platform or unknown */
  actor: string;
  actorRef?: string;
  trigger: string;
  /** success, failure or observed */
  outcome: string;
  reason?: string;
  container?: string;
  exitCode?: number;
  restartCount?: number;
  count: number;
  /** ISO-8601 UTC */
  firstAt: string;
  /** ISO-8601 UTC */
  lastAt: string;
  resourceIds?: Record<string, string>;
}

export interface InstanceEventsResponse {
  events: InstanceEvent[];
  nextCursor?: string;
  retentionDays: number;
  capturedSince: string;
  truncated: boolean;
  oldestRetainedAt?: string;
}

export interface InstanceEventsOptions {
  /** ISO-8601 UTC, inclusive (filters on lastAt) */
  from?: string;
  /** ISO-8601 UTC, exclusive (filters on lastAt) */
  to?: string;
  /** Event types to include */
  type?: string[];
  /** 1..200, the service default is 50 */
  limit?: number;
  /** The nextCursor of a previous response, passed through unchanged */
  cursor?: string;
}

/**
 * Get the recorded lifecycle events (restarts, crashes, replacements, volume
 * changes and more) of a service instance, newest first. For a High
 * Availability My App the second slot is the instance `<name>b`; call this
 * function for each name to read the whole history.
 * @memberof module:@osaas/client-core
 * @param {Context} ctx - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 * @param {string} name - The name of the service instance
 * @param {InstanceEventsOptions} options - Optional filters and paging
 * @returns {Promise<InstanceEventsResponse>} - The events and retention metadata
 * @example
 * import { Context, getInstanceEvents } from '@osaas/client-core';
 * const ctx = new Context();
 * const res = await getInstanceEvents(ctx, 'eyevinn-test-adserver', 'my-instance', { type: ['crash', 'oom'] });
 */
export async function getInstanceEvents(
  ctx: Context,
  serviceId: string,
  name: string,
  options: InstanceEventsOptions = {}
): Promise<InstanceEventsResponse> {
  const url = new URL(
    `/myinstances/${encodeURIComponent(serviceId)}/${encodeURIComponent(
      name
    )}/events`,
    `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`
  );
  if (options.from !== undefined) url.searchParams.set('from', options.from);
  if (options.to !== undefined) url.searchParams.set('to', options.to);
  if (options.type !== undefined && options.type.length > 0) {
    url.searchParams.set('type', options.type.join(','));
  }
  if (options.limit !== undefined) {
    url.searchParams.set('limit', String(options.limit));
  }
  if (options.cursor !== undefined) {
    url.searchParams.set('cursor', options.cursor);
  }
  return await createFetch<InstanceEventsResponse>(url, {
    method: 'GET',
    headers: {
      'x-pat-jwt': `Bearer ${ctx.getPersonalAccessToken()}`
    }
  });
}
