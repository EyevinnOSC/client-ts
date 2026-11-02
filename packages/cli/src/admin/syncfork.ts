import { createFetch, FetchError, Platform } from '@osaas/client-core';

interface ServiceMetadata {
  repoUrl?: string;
  title?: string;
  description?: string;
}

interface ServiceResponse {
  serviceId: string;
  serviceMetadata: ServiceMetadata;
}

interface SyncForkResponse {
  jobId: string;
}

interface SyncForkStatus {
  jobId: string;
  repositoryUrl: string;
  status: string;
  error?: {
    type: string;
    message: string;
    conflictFiles?: string[];
  };
}

export async function getServiceRepoUrl(
  serviceId: string,
  environment: string,
  apiKey: string | undefined
): Promise<string> {
  const catalogUrl = new URL(
    `https://catalog.svc.${environment}.osaas.io/service/${serviceId}`
  );
  const service = await createFetch<ServiceResponse>(catalogUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  const repoUrl = service.serviceMetadata?.repoUrl;
  if (!repoUrl) {
    throw new Error(
      `Service ${serviceId} does not have a repository URL in the catalog`
    );
  }
  return repoUrl;
}

export async function triggerSyncFork(
  repositoryUrl: string,
  platform: Platform
): Promise<string> {
  const syncUrl = new URL(
    `https://maker.svc.${platform.getEnvironment()}.osaas.io/sync-fork`
  );
  const res = await createFetch<SyncForkResponse>(syncUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${platform.getApiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ repositoryUrl })
  });
  return res.jobId;
}

export async function getSyncForkStatus(
  repositoryUrl: string,
  platform: Platform
): Promise<SyncForkStatus | undefined> {
  const statusUrl = new URL(
    `https://maker.svc.${platform.getEnvironment()}.osaas.io/sync-fork/by-repo`
  );
  statusUrl.searchParams.append('repositoryUrl', repositoryUrl);
  try {
    return await createFetch<SyncForkStatus>(statusUrl, {
      headers: {
        Authorization: `Bearer ${platform.getApiKey()}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    if (err instanceof FetchError && err.httpCode === 404) {
      return undefined;
    }
    throw err;
  }
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function waitForSyncFork(
  repositoryUrl: string,
  platform: Platform
): Promise<SyncForkStatus | undefined> {
  let running = true;
  while (running) {
    const status = await getSyncForkStatus(repositoryUrl, platform);
    if (!status) {
      return undefined;
    }
    if (status.status === 'pending' || status.status === 'running') {
      await delay(5000);
    } else {
      running = false;
      return status;
    }
  }
  return undefined;
}

const GITHUB_SEGMENT = /^[A-Za-z0-9_.-]+$/;

/**
 * Validates that the value is https://github.com/<owner>/<repo>[.git] and
 * throws a descriptive error otherwise. The URL is passed on unmodified since
 * maker-manager matches registered repositories on the exact string.
 */
export function assertGithubRepositoryUrl(value: string): void {
  const invalid = () =>
    new Error(
      `Invalid repository URL '${value}': expected https://github.com/<owner>/<repo>[.git]`
    );
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw invalid();
  }
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'github.com' ||
    url.port !== '' ||
    url.username !== '' ||
    url.password !== '' ||
    url.search !== '' ||
    url.hash !== '' ||
    value.endsWith('?') ||
    value.endsWith('#')
  ) {
    throw invalid();
  }
  const segments = url.pathname.split('/');
  // ['', owner, repo]
  if (segments.length !== 3 || segments[0] !== '') {
    throw invalid();
  }
  const owner = segments[1];
  const repo = segments[2].replace(/\.git$/, '');
  const ok = (s: string) => GITHUB_SEGMENT.test(s) && s !== '.' && s !== '..';
  if (!ok(owner) || !ok(repo)) {
    throw invalid();
  }
}

export interface RepoOrder {
  orderId: string;
  phase: string;
}

/**
 * Lists the orders for a repository with GET /maker?repositoryUrl=<url>, the
 * only query parameter, which is the one order lookup the dedicated sync-fork
 * key is accepted on. Errors are propagated (404 means no orders).
 */
export async function listOrdersByRepositoryUrl(
  repositoryUrl: string,
  platform: Platform
): Promise<RepoOrder[]> {
  const makerUrl = new URL(
    `https://maker.svc.${platform.getEnvironment()}.osaas.io/maker`
  );
  makerUrl.searchParams.append('repositoryUrl', repositoryUrl);
  try {
    const res = await createFetch<
      { order: { orderId: string; status?: { phase?: string } } }[]
    >(makerUrl, {
      headers: {
        Authorization: `Bearer ${platform.getApiKey()}`,
        'Content-Type': 'application/json'
      }
    });
    return res.map((o) => ({
      orderId: o.order.orderId,
      phase: o.order.status?.phase || ''
    }));
  } catch (err) {
    if (err instanceof FetchError && err.httpCode === 404) {
      return [];
    }
    throw err;
  }
}

// Same non-terminal phases as waitForOrder / getOrderIdByRepositoryUrl in client-core
const ACTIVE_PHASES = new Set(['NEW', 'PENDING', 'RUNNING']);

/**
 * Heuristic: the by-repo status carries no "changed" flag, so after the sync
 * job has succeeded we wait this long for a remake order to show up and then
 * assume the fork was already up to date.
 */
export const REMAKE_GRACE_MS = 60000;
export const REMAKE_POLL_INTERVAL_MS = 5000;

export type RemakeResult =
  | { outcome: 'done'; orderId: string }
  | { outcome: 'failed'; orderId: string; phase: string }
  | { outcome: 'no_remake' };

/**
 * Waits for the remake order started by a sync fork (call it once the sync
 * job has succeeded; the grace period REMAKE_GRACE_MS runs from the call), using only
 * GET /maker?repositoryUrl=. `before` is the order list captured before the
 * sync was triggered. An order is only accepted when it is new (orderId not in
 * `before`), is in an active phase, or its phase differs from the snapshot, so
 * a stale earlier DONE order is never mistaken for the new remake. A rebuild
 * can reuse the orderId, which is why the phase is compared as well.
 */
export async function waitForRemakeByRepositoryUrl(
  repositoryUrl: string,
  platform: Platform,
  before: RepoOrder[]
): Promise<RemakeResult> {
  const snapshot = new Map(before.map((o) => [o.orderId, o.phase]));
  let trackedId: string | undefined;
  let elapsedMs = 0;
  for (;;) {
    const orders = await listOrdersByRepositoryUrl(repositoryUrl, platform);
    let order: RepoOrder | undefined;
    if (trackedId) {
      order = orders.find((o) => o.orderId === trackedId);
    } else {
      order = orders.find(
        (o) =>
          !snapshot.has(o.orderId) ||
          ACTIVE_PHASES.has(o.phase) ||
          snapshot.get(o.orderId) !== o.phase
      );
      if (order) {
        trackedId = order.orderId;
      }
    }
    if (order) {
      if (!ACTIVE_PHASES.has(order.phase)) {
        return order.phase === 'DONE'
          ? { outcome: 'done', orderId: order.orderId }
          : { outcome: 'failed', orderId: order.orderId, phase: order.phase };
      }
    } else if (elapsedMs >= REMAKE_GRACE_MS) {
      return { outcome: 'no_remake' };
    }
    await delay(REMAKE_POLL_INTERVAL_MS);
    elapsedMs += REMAKE_POLL_INTERVAL_MS;
  }
}
