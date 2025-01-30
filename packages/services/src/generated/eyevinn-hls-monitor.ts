/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/': {
    /** Say hello */
    get: {
      responses: {
        /** The magical words! */
        200: {
          schema: string;
        };
      };
    };
  };
  '/hls-monitorinstance': {
    /** List all running hls-monitor instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the hls-monitor instance */
            name: string;
            /** @description URL to instance API */
            url: string;
            resources: {
              license: {
                /** @description URL to license information */
                url: string;
              };
              apiDocs?: {
                /** @description URL to instance API documentation */
                url: string;
              };
              app?: {
                /** @description URL to instance application (GUI) */
                url: string;
              };
            };
          }[];
        };
        /** Default Response */
        500: {
          schema: {
            /** @description Reason why something failed */
            reason: string;
          };
        };
      };
    };
    /** Launch a new hls-monitor instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the hls-monitor instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the hls-monitor instance */
            name: string;
            /** @description URL to instance API */
            url: string;
            resources: {
              license: {
                /** @description URL to license information */
                url: string;
              };
              apiDocs?: {
                /** @description URL to instance API documentation */
                url: string;
              };
              app?: {
                /** @description URL to instance application (GUI) */
                url: string;
              };
            };
          };
        };
        /** Default Response */
        403: {
          schema: {
            /** @description Reason why something failed */
            reason: string;
          };
        };
        /** Default Response */
        409: {
          schema: {
            /** @description Reason why something failed */
            reason: string;
          };
        };
        /** Default Response */
        500: {
          schema: {
            /** @description Reason why something failed */
            reason: string;
          };
        };
      };
    };
  };
  '/hls-monitorinstance/{id}': {
    /** Obtain status and resource URLs for an hls-monitor instance */
    get: {
      parameters: {
        path: {
          /** Name of the hls-monitor instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the hls-monitor instance */
            name: string;
            /** @description URL to instance API */
            url: string;
            resources: {
              license: {
                /** @description URL to license information */
                url: string;
              };
              apiDocs?: {
                /** @description URL to instance API documentation */
                url: string;
              };
              app?: {
                /** @description URL to instance application (GUI) */
                url: string;
              };
            };
          };
        };
        /** Default Response */
        404: {
          schema: {
            /** @description Reason why something failed */
            reason: string;
          };
        };
        /** Default Response */
        500: {
          schema: {
            /** @description Reason why something failed */
            reason: string;
          };
        };
      };
    };
    /** Stop and remove an hls-monitor instance */
    delete: {
      parameters: {
        path: {
          /** Name of the hls-monitor instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        204: {
          schema: string;
        };
        /** Default Response */
        500: {
          schema: {
            /** @description Reason why something failed */
            reason: string;
          };
        };
      };
    };
  };
  '/health/{id}': {
    /** Return status of hls-monitor instance */
    get: {
      parameters: {
        path: {
          /** Name of the hls-monitor instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @enum {string} */
            status: 'starting' | 'running' | 'stopped' | 'failed' | 'unknown';
          };
        };
        /** Default Response */
        500: {
          schema: {
            /** @description Reason why something failed */
            reason: string;
          };
        };
      };
    };
  };
  '/logs/{id}': {
    /** Return the latest logs from the hls-monitor instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the hls-monitor instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: string;
        };
        /** Default Response */
        500: {
          schema: {
            /** @description Reason why something failed */
            reason: string;
          };
        };
      };
    };
  };
  '/ports/{id}': {
    /** Return the exposed extra ports for hls-monitor instance */
    get: {
      parameters: {
        path: {
          /** Name of the hls-monitor instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            externalIp: string;
            externalPort: number;
            internalPort: number;
          }[];
        };
        /** Default Response */
        500: {
          schema: {
            /** @description Reason why something failed */
            reason: string;
          };
        };
      };
    };
  };
}

export interface definitions {}

export interface operations {}

export interface external {}

export type EyevinnHlsMonitor =
  paths['/hls-monitorinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnHlsMonitorConfig =
  paths['/hls-monitorinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-hls-monitor
 * @description Service to monitor one or more HLS-streams for manifest errors and inconsistencies.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://github.com/Eyevinn/hls-monitor|Online docs} for further information
 */

/**
 * @typedef {Object} EyevinnHlsMonitorConfig
 * @property {string} name - Name of hls-monitor

 * 
 */

/**
 * @typedef {Object} EyevinnHlsMonitor
 * @property {string} name - Name of the HLS Stream Monitor instance
 * @property {string} url - URL of the HLS Stream Monitor instance
 *
 */

/**
 * Create a new HLS Stream Monitor instance
 *
 * @memberOf eyevinn-hls-monitor
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnHlsMonitorConfig} body - Service instance configuration
 * @returns {EyevinnHlsMonitor} - Service instance
 * @example
 * import { Context, createEyevinnHlsMonitorInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnHlsMonitorInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnHlsMonitorInstance(
  ctx: Context,
  body: EyevinnHlsMonitorConfig
): Promise<EyevinnHlsMonitor> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-hls-monitor'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-hls-monitor',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-hls-monitor', instance.name, ctx);
  return instance;
}

/**
 * Remove a HLS Stream Monitor instance
 *
 * @memberOf eyevinn-hls-monitor
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the monitor to be removed
 */
export async function removeEyevinnHlsMonitorInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-hls-monitor'
  );
  await removeInstance(ctx, 'eyevinn-hls-monitor', name, serviceAccessToken);
}

/**
 * Get a HLS Stream Monitor instance
 *
 * @memberOf eyevinn-hls-monitor
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the monitor to be retrieved
 * @returns {EyevinnHlsMonitor} - Service instance
 */
export async function getEyevinnHlsMonitorInstance(
  ctx: Context,
  name: string
): Promise<EyevinnHlsMonitor> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-hls-monitor'
  );
  return await getInstance(
    ctx,
    'eyevinn-hls-monitor',
    name,
    serviceAccessToken
  );
}
