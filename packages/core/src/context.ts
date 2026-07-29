import { createFetch } from './fetch';

/**
 * The primary environment that hosts the authoritative platform control
 * plane (catalog-manager, token-service, money-manager) for the prod site
 * group. `prod-se` (Elastx) is a secondary site of this environment, not
 * an independent peer environment. Auth/entitlement calls made from a
 * `prod-se` context must always target the primary environment regardless
 * of which site a service instance is hosted on.
 */
export const PRIMARY_ENV = process.env.OSC_PRIMARY_ENV || 'prod';

/**
 * Environments that are sites of the same prod control plane rather than
 * independent environments. `dev` and `stage` are each a single,
 * self-contained cluster with their own catalog-manager/token-service, so
 * they are intentionally excluded here: platform calls made from a `dev`
 * or `stage` context must stay on `dev`/`stage`, not get redirected to
 * `prod`.
 */
export const PROD_SITE_ENVS = ['prod', 'prod-se'];

export type ContextConfig = {
  personalAccessToken?: string;
  environment?: string;
  /**
   * The environment to use for platform/auth calls (subscription checks,
   * service access token minting). Defaults to PRIMARY_ENV when
   * `environment` is a prod-site environment (`prod` or `prod-se`), so that
   * platform calls always reach the authoritative control plane even when
   * `environment` is set to a secondary site (e.g. `prod-se`). For `dev`
   * and `stage`, defaults to `environment` unchanged, since those are
   * independent environments with their own control plane. Only override
   * this if you explicitly need to target a non-default platform control
   * plane.
   */
  platformEnv?: string;
};

export type ServiceAccessToken = {
  serviceId: string;
  token: string;
  expiry: number;
};

export type Service = {
  serviceId: string;
  apiUrl: string;
  serviceType: 'instance' | 'job';
};

export type Subscriptions = {
  teamId: string;
  services: string[];
};

export class Context {
  private personalAccessToken?: string;
  private environment: string;
  private platformEnv: string;

  constructor(config?: ContextConfig) {
    if (!config?.personalAccessToken && !process.env.OSC_ACCESS_TOKEN) {
      throw new Error(
        'Personal access token is required to create a context. Please provide it in the config or set the OSC_ACCESS_TOKEN environment variable.'
      );
    }

    this.personalAccessToken = config?.personalAccessToken
      ? config.personalAccessToken
      : process.env.OSC_ACCESS_TOKEN;
    this.environment = config?.environment ? config.environment : 'prod';
    // Only `prod`/`prod-se` collapse onto PRIMARY_ENV. A caller on `dev`
    // or `stage` must keep platform calls on that same environment, not
    // get redirected to `prod`.
    this.platformEnv = config?.platformEnv
      ? config.platformEnv
      : PROD_SITE_ENVS.includes(this.environment)
      ? PRIMARY_ENV
      : this.environment;
  }

  getPersonalAccessToken() {
    return this.personalAccessToken;
  }

  getEnvironment() {
    return this.environment;
  }

  getPlatformEnvironment() {
    return this.platformEnv;
  }

  async getServiceAccessToken(serviceId: string): Promise<string> {
    const serviceUrl = new URL(
      `https://catalog.svc.${this.platformEnv}.osaas.io/mysubscriptions`
    );
    const services = await createFetch<Service[]>(serviceUrl, {
      method: 'GET',
      headers: {
        'x-pat-jwt': `Bearer ${this.personalAccessToken}`,
        'Content-Type': 'application/json'
      }
    });
    const service = services.find((svc) => svc.serviceId === serviceId);
    if (!service) {
      await this.activateService(serviceId);
    }

    const satUrl = new URL(
      `https://token.svc.${this.platformEnv}.osaas.io/servicetoken`
    );
    const serviceAccessToken = await createFetch<ServiceAccessToken>(satUrl, {
      method: 'POST',
      body: JSON.stringify({ serviceId }),
      headers: {
        'x-pat-jwt': `Bearer ${this.personalAccessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return serviceAccessToken.token;
  }

  async activateService(serviceId: string) {
    const serviceUrl = new URL(
      `https://catalog.svc.${this.platformEnv}.osaas.io/mysubscriptions`
    );
    await createFetch<Subscriptions>(serviceUrl, {
      method: 'POST',
      body: JSON.stringify({ services: [serviceId] }),
      headers: {
        'x-pat-jwt': `Bearer ${this.personalAccessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async refreshServiceAccessToken(serviceId: string) {
    return await this.getServiceAccessToken(serviceId);
  }
}
