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

async function getInstanceLink(
  context: Context,
  token: string,
  serviceId: string,
  name: string,
  linkRel: string
) {
  const instance = await getInstance(context, serviceId, name, token);
  if (!instance) {
    throw new Error(`Instance ${name} of service ${serviceId} not found`);
  }
  const link = instance._links ? instance._links[linkRel] : undefined;
  const service = await getService(context, serviceId);
  const serviceApiUrl = new URL(service.apiUrl);
  if (!link) {
    // Handle backwards compatibility for old instances
    if (linkRel === 'ports') {
      return new URL('https://' + serviceApiUrl.host + '/ports/' + name);
    } else if (linkRel === 'logs') {
      return new URL('https://' + serviceApiUrl.host + '/logs/' + name);
    } else if (linkRel === 'health') {
      return new URL('https://' + serviceApiUrl.host + '/health/' + name);
    }
  } else if (link.href) {
    return new URL('https://' + serviceApiUrl.host + link.href);
  }
  throw new Error(
    `Link ${linkRel} not found for instance ${name} of service ${serviceId}`
  );
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
  const portsUrl = await getInstanceLink(
    context,
    token,
    serviceId,
    name,
    'ports'
  );

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
  const logsUrl = await getInstanceLink(
    context,
    token,
    serviceId,
    name,
    'logs'
  );

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
  const healthUrl = await getInstanceLink(
    context,
    token,
    serviceId,
    name,
    'health'
  );

  const { status } = await createFetch<{ status: string }>(healthUrl, {
    method: 'GET',
    headers: {
      'x-jwt': `Bearer ${token}`
    }
  });
  return status;
}

/**
 * Restart an instance of a service in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 * @param {string} name - The name of the service instance
 * @param {string} token - Service access token
 */

export async function restartInstance(
  context: Context,
  serviceId: string,
  name: string,
  token: string
) {
  const restartUrl = await getInstanceLink(
    context,
    token,
    serviceId,
    name,
    'restart'
  );
  await createFetch(restartUrl, {
    method: 'POST',
    headers: {
      'x-jwt': `Bearer ${token}`
    }
  });
}

/**
 * Get scaling information for an instance of a service in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 * @param {string} name - The name of the service instance
 * @param {string} token - Service access token
 * @returns {Object} - Scaling information with actualReplicas and desiredReplicas
 */
export async function getInstanceScaling(
  context: Context,
  serviceId: string,
  name: string,
  token: string
): Promise<{ actualReplicas: number; desiredReplicas: number }> {
  try {
    const scaleUrl = await getInstanceLink(
      context,
      token,
      serviceId,
      name,
      'scale'
    );
    return await createFetch<{
      actualReplicas: number;
      desiredReplicas: number;
    }>(scaleUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    Log().debug(err);
    throw new Error(
      `Instance ${name} of service ${serviceId} does not support scaling`
    );
  }
}

/**
 * Scale the number of replicas for an instance of a service in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 * @param {string} name - The name of the service instance
 * @param {number} replicas - Desired number of replicas
 * @param {string} token - Service access token
 */
export async function scaleInstanceReplicas(
  context: Context,
  serviceId: string,
  name: string,
  replicas: number,
  token: string
) {
  try {
    const scaleUrl = await getInstanceLink(
      context,
      token,
      serviceId,
      name,
      'scale'
    );
    await createFetch(scaleUrl, {
      method: 'PUT',
      body: JSON.stringify({ desiredReplicas: replicas }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    Log().debug(err);
    throw new Error(
      `Instance ${name} of service ${serviceId} could not be scaled`
    );
  }
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

export async function saveSecret(
  serviceId: string,
  name: string,
  value: string,
  ctx: Context
) {
  const secretsUrl = new URL(
    `/mysecrets/${serviceId}`,
    `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`
  );
  await createFetch(secretsUrl, {
    method: 'POST',
    body: JSON.stringify({
      secretName: name,
      secretData: value
    }),
    headers: {
      'x-pat-jwt': `Bearer ${ctx.getPersonalAccessToken()}`,
      'Content-Type': 'application/json'
    }
  });
}
