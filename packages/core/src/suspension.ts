import { Context } from './context';
import { createFetch, FetchError } from './fetch';
import { Log } from './log';

/**
 * Clear a stale suspension record for a service instance name in Open Source
 * Cloud. A record left behind by an earlier, deleted instance would otherwise
 * exempt a recreated instance with the same name from suspension enforcement.
 * This is best effort: a missing record (404) is a no-op and any other
 * failure is logged at debug level and swallowed. It never throws.
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 * @param {string} name - The name of the service instance
 * @example
 * import { Context, clearSuspensionRecord } from '@osaas/client-core';
 * const ctx = new Context();
 * await clearSuspensionRecord(ctx, 'eyevinn-test-adserver', 'my-instance');
 */
export async function clearSuspensionRecord(
  context: Context,
  serviceId: string,
  name: string
): Promise<void> {
  try {
    const url = new URL(
      `/mysuspended/${encodeURIComponent(serviceId)}/${encodeURIComponent(
        name
      )}`,
      `https://deploy.svc.${context.getEnvironment()}.osaas.io`
    );
    await createFetch<unknown>(url, {
      method: 'DELETE',
      headers: {
        'x-pat-jwt': `Bearer ${context.getPersonalAccessToken()}`
      }
    });
  } catch (err) {
    if (err instanceof FetchError && err.httpCode === 404) {
      return;
    }
    Log().debug(
      `Failed to clear suspension record for ${serviceId}/${name}: ${
        (err as Error).message
      }`
    );
  }
}
