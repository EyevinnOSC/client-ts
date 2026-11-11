import type { TenantPlan } from './money';

export const TOKEN_SUSPEND_THRESHOLD = -200;

/**
 * Whether the token-balance sweep may suspend instances for a tenant on this
 * plan. FREE and self-service paid plans are enforced. Tenants without a plan
 * record, ENTERPRISE (billed by agreement) and managed reseller sub-workspaces
 * or tenants with the sub-workspace billing exception (billed off-platform)
 * are never suspended by the sweep.
 */
export function isSuspendableByTokenBalance(plan?: TenantPlan): boolean {
  if (!plan || !plan.planType) return false;
  if (plan.planType === 'ENTERPRISE') return false;
  if (plan.managedTenant || plan.subWorkspaceBillingException) return false;
  return true;
}
