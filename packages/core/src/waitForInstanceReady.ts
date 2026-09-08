import { Context } from './context';
import { InstanceReadyTimeoutError } from './errors';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface WaitForInstanceReadyOptions {
  /**
   * Maximum wall-clock time to wait in milliseconds. Defaults to 300,000 (5 min).
   * Pass Infinity to restore the old unbounded behaviour.
   */
  timeoutMs?: number;
  /** Poll interval in milliseconds. Defaults to 1,000. */
  pollIntervalMs?: number;
  /** AbortSignal to cancel the wait early. */
  signal?: AbortSignal;
}

export async function waitForInstanceReady(
  serviceId: string,
  name: string,
  ctx: Context,
  opts?: WaitForInstanceReadyOptions
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);
  const deadline = Date.now() + (opts?.timeoutMs ?? 300_000);
  const pollInterval = opts?.pollIntervalMs ?? 1000;

  if (opts?.signal?.aborted) {
    const abortErr = new Error('waitForInstanceReady was aborted');
    abortErr.name = 'AbortError';
    throw abortErr;
  }

  while (Date.now() < deadline && !opts?.signal?.aborted) {
    await delay(pollInterval);
    if (opts?.signal?.aborted) {
      const abortErr = new Error('waitForInstanceReady was aborted');
      abortErr.name = 'AbortError';
      throw abortErr;
    }
    // Lazy require to avoid circular dependency with ./core at module load time.
    // Jest mocks are fully resolved by call time, so this correctly intercepts
    // the mock in test environments.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getInstanceHealth } = require('./core') as typeof import('./core');
    const status = await getInstanceHealth(
      ctx,
      serviceId,
      name,
      serviceAccessToken
    );
    if (status && status === 'running') {
      return;
    }
  }

  if (opts?.signal?.aborted) {
    const abortErr = new Error('waitForInstanceReady was aborted');
    abortErr.name = 'AbortError';
    throw abortErr;
  }
  throw new InstanceReadyTimeoutError(
    `Instance '${name}' of service '${serviceId}' did not reach running state within ${
      opts?.timeoutMs ?? 300_000
    }ms`
  );
}
