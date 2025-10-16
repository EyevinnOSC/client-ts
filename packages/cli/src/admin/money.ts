import { createFetch } from '@osaas/client-core';
import { apiKey } from './token';

export type TenantTokenCount = {
  tenantId: string;
  tokenCount: number;
  availableTokens: number;
  remainingTokens: number;
};

export type TenantPlan = {
  tenantId: string;
  planType: string;
};

export async function getTenantTokenCounts(environment: string) {
  const moneyManagerUrl = `https://money.svc.${environment}.osaas.io`;

  const tokenCounts = await createFetch<TenantTokenCount[]>(
    new URL('/tokencount', moneyManagerUrl),
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${apiKey()}`
      }
    }
  );
  return tokenCounts;
}

export async function getTenantPlanMap(environment: string) {
  const moneyManagerUrl = `https://money.svc.${environment}.osaas.io`;

  const tenantPlans = await createFetch<TenantPlan[]>(
    new URL('/tenantplan', moneyManagerUrl),
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${apiKey()}`
      }
    }
  );
  const tenantPlanMap: Record<string, TenantPlan> = {};
  for (const plan of tenantPlans) {
    tenantPlanMap[plan.tenantId] = plan;
  }
  return tenantPlanMap;
}
