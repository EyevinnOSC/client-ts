import type { TenantPlan } from './money';

export const TOKEN_SUSPEND_THRESHOLD = -200;

const FREE_PLAN = 'FREE';
const PAID_SELF_SERVICE_PLANS = ['PERSONAL', 'PROFESSIONAL', 'BUSINESS'];

/**
 * Whether the token-balance sweep may suspend instances for a tenant on this
 * plan. Allowlist: FREE (always, regardless of flags) and the self-service
 * paid plans PERSONAL, PROFESSIONAL and BUSINESS. A paid tenant that is a
 * managed reseller sub-workspace, or has the sub-workspace billing exception
 * (billed off-platform), is skipped. ENTERPRISE, unknown plan types and
 * tenants without a plan record are never suspended by the sweep.
 */
export function isSuspendableByTokenBalance(plan?: TenantPlan): boolean {
  if (!plan) return false;
  if (plan.planType === FREE_PLAN) return true;
  if (!PAID_SELF_SERVICE_PLANS.includes(plan.planType)) return false;
  return !plan.managedTenant && !plan.subWorkspaceBillingException;
}
