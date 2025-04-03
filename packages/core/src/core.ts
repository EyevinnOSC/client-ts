import { Context, Service } from './context';
import { InvalidName, UnauthorizedError } from './errors';
import { FetchError, createFetch } from './fetch';
import { Log } from './log';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getService(context: Context, serviceId: string) {
  const serviceUrl = new URL(
    `https://catalog.svc.${context.getEnvironment()}.osaas.io/mysubscriptions`
  );
  const services = await createFetch<Service[]>(serviceUrl, {
    method: 'GET',
    headers: {
      'x-pat-jwt': `Bearer ${context.getPersonalAccessToken()}`,
      'Content-Type': 'application/json'
    }
  });
  const service = services.find((svc) => svc.serviceId === serviceId);
  if (!service) {
    throw new Error(`Service ${serviceId} not found in your subscriptions`);
  }
  return service;
}

export const isValidInstanceName = (name: string) => {
  return /^[a-z0-9]+$/.test(name);
};

export type Port = {
  externalIp: string;
  externalPort: number;
  internalPort: number;
};

/**
 * @typedef ServiceInstance
 * @type object
 * @property {string} name - Service instance name
 * @property {string} url - Service instance URL
 * @property ... - Service specific properties
 */

/**
 * Create a new instance of a service in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - Service identifier. The service identifier is {github-organization}-{github-repo}
 * @param {string} token - Service access token
 * @param {object} body - Service instance options. The options are service specific
 * @returns {ServiceInstance} - Service instance
 * @example
 * import { Context, createInstance } from '@osaas/client-core';
 *
 * const ctx = new Context();
 * const sat = await ctx.getServiceAccessToken('eyevinn-test-adserver');
 * const instance = await createInstance(ctx, 'eyevinn-test-adserver', sat, { name: 'my-instance' });
 * console.log(instance.url);
 */
export async function createInstance(
  context: Context,
  serviceId: string,
  token: string,
  body: any
): Promise<any> {
  if (!isValidInstanceName(body.name)) {
    throw new InvalidName(body.name);
  }
  const service = await getService(context, serviceId);
  const instanceUrl = new URL(service.apiUrl);

  const instance = await createFetch<any>(instanceUrl, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'x-jwt': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return instance;
}

/**
 * Remove an instance of a service in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 * @param {string} name - The name of the service instance to remove
 * @param {string} token - Service access token
 * @example
 * import { Context, removeInstance } from '@osaas/client-core';
 * const ctx = new Context();
 * const sat = await ctx.getServiceAccessToken('eyevinn-test-adserver');
 * await removeInstance(ctx, 'eyevinn-test-adserver', 'my-instance', sat);
 */
export async function removeInstance(
  context: Context,
  serviceId: string,
  name: string,
  token: string
) {
  const service = await getService(context, serviceId);
  const instanceUrl = new URL(service.apiUrl + '/' + name);

  await createFetch<any>(instanceUrl, {
    method: 'DELETE',
    headers: {
      'x-jwt': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Retrieve an instance of a service in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 * @param {string} name - The name of the service instance to remove
 * @param {string} token - Service access token
 * @returns {ServiceInstance} - Service instance
 */
export async function getInstance(
  context: Context,
  serviceId: string,
  name: string,
  token: string
) {
  const service = await getService(context, serviceId);
  const instanceUrl = new URL(service.apiUrl + '/' + name);

  try {
    const instance = await createFetch<any>(instanceUrl, {
      method: 'GET',
      headers: {
        'x-jwt': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return instance;
  } catch (err) {
    Log().debug(err);
    if (err instanceof FetchError && err.httpCode === 401) {
      throw new UnauthorizedError();
    } else if (err instanceof FetchError && err.httpCode === 404) {
      return undefined;
    }
  }
  return undefined;
}

/**
 * List all instances of a service in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 * @param {string} token - Service access token
 * @returns {Array.<ServiceInstance>} - List of instances
 */
export async function listInstances(
  context: Context,
  serviceId: string,
  token: string
) {
  const service = await getService(context, serviceId);
  const instanceUrl = new URL(service.apiUrl);

  return await createFetch<any>(instanceUrl, {
    method: 'GET',
    headers: {
      'x-jwt': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * List all extra TCP ports routed to an instance in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 * @param {string} name - The name of the service instance
 * @param {string} token - Service access token
 * @returns {Array.<Port>} - List of ports
 */
export async function getPortsForInstance(
  context: Context,
  serviceId: string,
  name: string,
  token: string
): Promise<Port[]> {
  const service = await getService(context, serviceId);
  const instanceUrl = new URL(service.apiUrl);
  const portsUrl = new URL('https://' + instanceUrl.host + '/ports/' + name);

  return await createFetch<Port[]>(portsUrl, {
    method: 'GET',
    headers: {
      'x-jwt': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Get logs for an instance of a service in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 * @param {string} name - The name of the service instance
 * @param {string} token - Service access token
 * @returns {string | string[]} - Log rows
 */
export async function getLogsForInstance(
  context: Context,
  serviceId: string,
  name: string,
  token: string
): Promise<string | string[]> {
  const service = await getService(context, serviceId);
  const instanceUrl = new URL(service.apiUrl);
  const logsUrl = new URL('https://' + instanceUrl.host + '/logs/' + name);

  return await createFetch<string | string[]>(logsUrl, {
    method: 'GET',
    headers: {
      'x-jwt': `Bearer ${token}`
    }
  });
}

export async function getInstanceHealth(
  context: Context,
  serviceId: string,
  name: string,
  token: string
) {
  const service = await getService(context, serviceId);
  const instanceUrl = new URL(service.apiUrl);
  const healthUrl = new URL('/health/' + name, instanceUrl);

  const { status } = await createFetch<{ status: string }>(healthUrl, {
    method: 'GET',
    headers: {
      'x-jwt': `Bearer ${token}`
    }
  });
  return status;
}

export function instanceValue(
  instance: { [key: string]: string },
  key: string
) {
  return instance[key].match(/^{{secrets}}/) ? '***' : instance[key];
}

export function valueOrSecret(value: string) {
  return value.match(/^{{secrets}}/) ? '***' : value;
}

export async function waitForInstanceReady(
  serviceId: string,
  name: string,
  ctx: Context
) {
  const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);
  let instanceOk = false;
  while (!instanceOk) {
    await delay(1000);
    const status = await getInstanceHealth(
      ctx,
      serviceId,
      name,
      serviceAccessToken
    );
    if (status && status === 'running') {
      instanceOk = true;
    }
  }
}
