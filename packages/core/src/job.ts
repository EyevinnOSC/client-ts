import { Context } from './context';
import {
  createInstance,
  getInstance,
  listInstances,
  removeInstance,
  getService
} from './core';

const MAX_ITER = 1000;
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * @typedef ServiceJob
 * @type object
 * @property {string} name - Service job name
 * @property ... - Service specific job properties
 */

/**
 * Create a new service job in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - Service identifier. The service identifier is {github-organization}-{github-repo}
 * @param {string} token - Service access token
 * @param {object} body - Service job options. The options are service specific
 * @returns {ServiceJob} - Service job. The job is specific to the service
 * @example
 * import { Context, createJob } from '@osaas/client-core';
 * const serviceAccessToken = await ctx.getServiceAccessToken(
 *  'eyevinn-docker-retransfer'
 * );
 * const job = await createJob(
 *   ctx,
 *   'eyevinn-docker-retransfer',
 *   serviceAccessToken,
 *   {
 *     name: 'example',
 *     awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
 *     awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
 *     cmdLineArgs: 's3://source/myfile.txt s3://dest/'
 *   }
 * );
 */
export async function createJob(
  context: Context,
  serviceId: string,
  token: string,
  body: any
): Promise<any> {
  const service = await getService(context, serviceId);

  if (service.serviceType !== 'job') {
    throw new Error('Service is not a job service');
  }
  return await createInstance(context, serviceId, token, body);
}

/**
 * Remove a service job in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - Service identifier. The service identifier is {github-organization}-{github-repo}
 * @param {string} name - Name of service job to remove
 * @param {string} token - Service access token
 */
export async function removeJob(
  context: Context,
  serviceId: string,
  name: string,
  token: string
) {
  const service = await getService(context, serviceId);
  if (service.serviceType !== 'job') {
    throw new Error('Service is not a job service');
  }
  return await removeInstance(context, serviceId, name, token);
}

/**
 * Get a service job in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - Service identifier. The service identifier is {github-organization}-{github-repo}
 * @param {string} name - Name of service job to read
 * @param {string} token - Service access token
 */
export async function getJob(
  context: Context,
  serviceId: string,
  name: string,
  token: string
) {
  const service = await getService(context, serviceId);
  if (service.serviceType !== 'job') {
    throw new Error('Service is not a job service');
  }
  return await getInstance(context, serviceId, name, token);
}

/**
 * List service jobs in Open Source Cloud
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - Service identifier. The service identifier is {github-organization}-{github-repo}
 * @param {string} token - Service access token
 */
export async function listJobs(
  context: Context,
  serviceId: string,
  token: string
) {
  const service = await getService(context, serviceId);
  if (service.serviceType !== 'job') {
    throw new Error('Service is not a job service');
  }
  return await listInstances(context, serviceId, token);
}

/**
 * Options for waitForJobToComplete
 * @memberof module:@osaas/client-core
 * @typedef {Object} WaitForJobOptions
 * @property {number} [timeoutMs] - Maximum time in milliseconds to wait for the job to complete.
 *   When omitted the function polls up to MAX_ITER (1000) iterations (~16 min).
 *   When set, the function throws if the wall-clock time exceeds this value.
 */
export interface WaitForJobOptions {
  timeoutMs?: number;
}

/**
 * Wait for a service job to complete
 * @memberof module:@osaas/client-core
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} serviceId - Service identifier. The service identifier is {github-organization}-{github-repo}
 * @param {string} name - Name of service job to wait for
 * @param {string} token - Service access token
 * @param {WaitForJobOptions} [options] - Optional settings
 * @param {number} [options.timeoutMs] - Wall-clock timeout in milliseconds; throws if exceeded
 * @returns {Promise<any>} - The completed job object
 * @throws {Error} If the job reaches a terminal failure state ('Failed' or 'FailureTarget')
 * @throws {Error} If timeoutMs is set and the job does not complete within the given time
 *
 * Terminal success statuses (status or health field): 'Complete', 'SuccessCriteriaMet'
 * Terminal failure statuses (status or health field): 'Failed', 'FailureTarget'
 */
export async function waitForJobToComplete(
  context: Context,
  serviceId: string,
  name: string,
  token: string,
  options?: WaitForJobOptions
): Promise<any> {
  const deadline =
    options?.timeoutMs !== undefined
      ? Date.now() + options.timeoutMs
      : undefined;

  for (const _ of Array(MAX_ITER)) {
    if (deadline !== undefined && Date.now() >= deadline) {
      throw new Error(`Job '${name}' timed out after ${options!.timeoutMs}ms`);
    }
    const job = await getJob(context, serviceId, name, token);
    const terminalSuccess = new Set(['Complete', 'SuccessCriteriaMet']);
    const terminalFailure = new Set(['Failed', 'FailureTarget']);
    if (terminalSuccess.has(job.status) || terminalSuccess.has(job.health)) {
      return job;
    }
    if (terminalFailure.has(job.status) || terminalFailure.has(job.health)) {
      const signal = terminalFailure.has(job.status) ? job.status : job.health;
      throw new Error(`Job '${name}' failed with status: ${signal}`);
    }
    await delay(1000);
  }
}
