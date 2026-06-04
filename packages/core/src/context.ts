import { createFetch } from './fetch';

export type ContextConfig = {
  personalAccessToken?: string;
  environment?: string;
  tlsRejectUnauthorized?: boolean;
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
  private _tlsRejectUnauthorized: boolean;

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
    this._tlsRejectUnauthorized =
      config?.tlsRejectUnauthorized !== false ? true : false;
  }

  getPersonalAccessToken() {
    return this.personalAccessToken;
  }

  getEnvironment() {
    return this.environment;
  }

  get tlsRejectUnauthorized() {
    return this._tlsRejectUnauthorized;
  }

  async getServiceAccessToken(serviceId: string): Promise<string> {
    const serviceUrl = new URL(
      `https://catalog.svc.${this.environment}.osaas.io/mysubscriptions`
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
      `https://token.svc.${this.environment}.osaas.io/servicetoken`
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
      `https://catalog.svc.${this.environment}.osaas.io/mysubscriptions`
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
