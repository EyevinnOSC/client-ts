import {
  Context,
  createFetch,
  listInstances,
  removeInstance
} from '@osaas/client-core';
import { generatePat, apiKey } from './token';

export async function listInstancesForTenant(
  tenantId: string,
  serviceId: string,
  environment: string
): Promise<string[]> {
  const pat = generatePat(tenantId, 'osc-admin');

  const ctx = new Context({ personalAccessToken: pat, environment });
  const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);

  const instances = await listInstances(ctx, serviceId, serviceAccessToken);
  return instances.map((instance: { name: string }) => instance.name);
}

export async function removeInstanceForTenant(
  tenantId: string,
  serviceId: string,
  name: string,
  environment: string
) {
  const pat = generatePat(tenantId, 'osc-admin');

  const ctx = new Context({ personalAccessToken: pat, environment });
  const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);

  await removeInstance(ctx, serviceId, name, serviceAccessToken);
}

export async function suspendInstanceForTenant(
  tenantId: string,
  serviceId: string,
  name: string,
  environment: string,
  reason?: string
) {
  const suspendUrl = new URL(
    `/suspended/${serviceId}/${name}`,
    `https://deploy.svc.${environment}.osaas.io`
  );
  await createFetch(suspendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey()}`
    },
    body: JSON.stringify({ tenantId, reason: reason ?? 'token_limit_exceeded' })
  });
}

export async function getInstancesToRemove(
  tenantId: string,
  environment: string
): Promise<{ serviceId: string; instance: string }[]> {
  const instancesUrl = `https://deploy.svc.${environment}.osaas.io/instances/${tenantId}`;
  const instances = await createFetch<
    Array<{
      tenantId: string;
      serviceId: string;
      instanceName: string;
      created: string;
    }>
  >(instancesUrl, {
    headers: {
      Authorization: `Bearer ${apiKey()}`
    }
  });
  return instances.map(({ serviceId, instanceName }) => ({
    serviceId,
    instance: instanceName
  }));
}
