import { Context, listInstances, removeInstance } from '@osaas/client-core';
import { generatePat } from './token';
import { listSubscriptionsForTenant } from './subscription';

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
