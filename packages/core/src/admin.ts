import { Context } from './context';
import { createFetch } from './fetch';

export type Subscription = {
  serviceId: string;
  tenantId: string;
};

export type ReservedNode = {
  name: string;
  purposes: string[];
  publicIps: string[];
  capacity: {
    cpu: string;
    memory: string;
    storage: string;
  };
  reservations: string[];
};

/**
 * @typedef Subscription
 * @type object
 * @property {string} serviceId - The service identifier
 * @property {string} tenantId - The tenant identifier
 */

/**
 * @typedef ReservedNode
 * @type object
 * @property {string} name - The name of the reserved node
 * @property {string[]} purposes - The purposes of the reserved node
 * @property {string[]} publicIps - The public IPs of the reserved node
 * @property {object} capacity - The capacity of the reserved node
 * @property {string} capacity.cpu - The CPU capacity of the reserved node
 * @property {string} capacity.memory - The memory capacity of the reserved node
 * @property {string} capacity.storage - The storage capacity of the reserved node
 * @property {string[]} reservations - The reservations of the reserved node
 * @property ... - Service specific properties
 */

/**
 * List all my active subscriptions
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @returns {Array.<Subscription>} - List of active subscriptions
 */
export async function listSubscriptions(
  context: Context
): Promise<Subscription[]> {
  const serviceUrl = new URL(
    `https://catalog.svc.${context.getEnvironment()}.osaas.io/mysubscriptions`
  );

  return await createFetch<Subscription[]>(serviceUrl, {
    method: 'GET',
    headers: {
      'x-pat-jwt': `Bearer ${context.getPersonalAccessToken()}`,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Remove an active subscription
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - The service identifier
 */

export async function removeSubscription(
  context: Context,
  serviceId: string
): Promise<void> {
  const serviceUrl = new URL(
    `https://catalog.svc.${context.getEnvironment()}.osaas.io/mysubscriptions/${serviceId}`
  );

  await createFetch<{ reason: string } | string>(serviceUrl, {
    method: 'DELETE',
    body: JSON.stringify({ services: [serviceId] }),
    headers: {
      'x-pat-jwt': `Bearer ${context.getPersonalAccessToken()}`,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * List my reserved nodes
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @returns {Array.<ReservedNode>} - List of reserved nodes
 */

export async function listReservedNodes(
  context: Context
): Promise<ReservedNode[]> {
  const deployUrl = new URL(
    `https://deploy.svc.${context.getEnvironment()}.osaas.io/mynodes`
  );

  return await createFetch<ReservedNode[]>(deployUrl, {
    method: 'GET',
    headers: {
      'x-pat-jwt': `Bearer ${context.getPersonalAccessToken()}`,
      'Content-Type': 'application/json'
    }
  });
}
