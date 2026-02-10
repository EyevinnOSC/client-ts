/** @module @osaas/client-core */
export { Log } from './log';
export { createFetch, FetchError } from './fetch';
export { Context } from './context';
export { Platform } from './platform';
export {
  createInstance,
  removeInstance,
  getInstance,
  listInstances,
  getPortsForInstance,
  getLogsForInstance,
  getInstanceHealth,
  instanceValue,
  valueOrSecret,
  isValidInstanceName,
  waitForInstanceReady,
  saveSecret,
  restartInstance,
  getInstanceScaling,
  scaleInstanceReplicas
} from './core';
export {
  listSubscriptions,
  removeSubscription,
  Subscription,
  listReservedNodes,
  ReservedNode
} from './admin';
export {
  createJob,
  removeJob,
  getJob,
  listJobs,
  waitForJobToComplete
} from './job';
export * from './platform/maker';
export * from './errors';
export * from './myapp';
