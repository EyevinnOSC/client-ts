import { createFetch, FetchError, Log, Platform } from '@osaas/client-core';

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

export async function triggerOrchestratorRemake(
  orderId: string,
  platform: Platform
): Promise<string | undefined> {
  try {
    const remakerUrl = new URL(
      `https://maker.svc.${platform.getEnvironment()}.osaas.io/remaker/orchestrator`
    );
    const res = await createFetch<{ orderId: string }>(remakerUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${platform.getApiKey()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId })
    });
    Log().debug(res);
    return res.orderId;
  } catch (err) {
    Log().debug(err);
    if (err instanceof FetchError && err.httpCode === 404) {
      return undefined;
    }
    throw err;
  }
}
