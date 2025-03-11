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
  '/intercom-managerinstance': {
    /** List all running intercom-manager instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the intercom-manager instance */
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
            smbUrl: string;
            smbApiKey?: string;
            mongodbUrl: string;
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
    /** Launch a new intercom-manager instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the intercom-manager instance */
            name: string;
            smbUrl: string;
            smbApiKey?: string;
            mongodbUrl: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the intercom-manager instance */
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
            smbUrl: string;
            smbApiKey?: string;
            mongodbUrl: string;
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
  '/intercom-managerinstance/{id}': {
    /** Obtain status and resource URLs for an intercom-manager instance */
    get: {
      parameters: {
        path: {
          /** Name of the intercom-manager instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the intercom-manager instance */
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
            smbUrl: string;
            smbApiKey?: string;
            mongodbUrl: string;
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
    /** Stop and remove an intercom-manager instance */
    delete: {
      parameters: {
        path: {
          /** Name of the intercom-manager instance */
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
    /** Return status of intercom-manager instance */
    get: {
      parameters: {
        path: {
          /** Name of the intercom-manager instance */
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
    /** Return the latest logs from the intercom-manager instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the intercom-manager instance */
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
    /** Return the exposed extra ports for intercom-manager instance */
    get: {
      parameters: {
        path: {
          /** Name of the intercom-manager instance */
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

export type EyevinnIntercomManager =
  paths['/intercom-managerinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnIntercomManagerConfig =
  paths['/intercom-managerinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-intercom-manager
 * @description Open Source Intercom Solution providing production-grade audio quality and real-time latency. Powered by Symphony Media Bridge open source media server.

Join our Slack community for support and customization. Contact sales@eyevinn.se for further development and support. Visit Eyevinn Technology for innovative video solutions.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://docs.osaas.io/osaas.wiki/Service:-Intercom.html|Online docs} for further information
 */

/**
 * @typedef {Object} EyevinnIntercomManagerConfig
 * @property {string} name - Name of intercom-manager
 * @property {string} smbUrl - SmbUrl
 * @property {string} [smbApiKey] - SmbApiKey
 * @property {string} mongodbUrl - MongodbUrl

 * 
 */

/**
 * @typedef {Object} EyevinnIntercomManager
 * @property {string} name - Name of the Intercom instance
 * @property {string} url - URL of the Intercom instance
 *
 */

/**
 * Create a new Intercom instance
 *
 * @memberOf eyevinn-intercom-manager
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnIntercomManagerConfig} body - Service instance configuration
 * @returns {EyevinnIntercomManager} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createEyevinnIntercomManagerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: EyevinnIntercomManagerConfig = { name: 'myinstance', ... };
 * const instance = await createEyevinnIntercomManagerInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createEyevinnIntercomManagerInstance(
  ctx: Context,
  body: EyevinnIntercomManagerConfig
): Promise<EyevinnIntercomManager> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-intercom-manager'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-intercom-manager',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-intercom-manager', instance.name, ctx);
  return instance;
}

/**
 * Remove a Intercom instance
 *
 * @memberOf eyevinn-intercom-manager
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the system to be removed
 */
export async function removeEyevinnIntercomManagerInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-intercom-manager'
  );
  await removeInstance(
    ctx,
    'eyevinn-intercom-manager',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Intercom instance
 *
 * @memberOf eyevinn-intercom-manager
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the system to be retrieved
 * @returns {EyevinnIntercomManager} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getEyevinnIntercomManagerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getEyevinnIntercomManagerInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getEyevinnIntercomManagerInstance(
  ctx: Context,
  name: string
): Promise<EyevinnIntercomManager> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-intercom-manager'
  );
  return await getInstance(
    ctx,
    'eyevinn-intercom-manager',
    name,
    serviceAccessToken
  );
}
