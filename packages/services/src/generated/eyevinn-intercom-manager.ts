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
 * Create a new Intercom instance
 * 
 * @description Open Source Intercom Solution providing production-grade audio quality and real-time latency. Powered by Symphony Media Bridge open source media server.

Join our Slack community for support and customization. Contact sales@eyevinn.se for further development and support. Visit Eyevinn Technology for innovative video solutions.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnIntercomManagerConfig}} body - Service instance configuration
 * @returns {EyevinnIntercomManager} - Service instance
 * @example
 * import { Context, createEyevinnIntercomManagerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnIntercomManagerInstance(ctx, { name: 'myinstance' });
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
 * @description Open Source Intercom Solution providing production-grade audio quality and real-time latency. Powered by Symphony Media Bridge open source media server.

Join our Slack community for support and customization. Contact sales@eyevinn.se for further development and support. Visit Eyevinn Technology for innovative video solutions.
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
 * @description Open Source Intercom Solution providing production-grade audio quality and real-time latency. Powered by Symphony Media Bridge open source media server.

Join our Slack community for support and customization. Contact sales@eyevinn.se for further development and support. Visit Eyevinn Technology for innovative video solutions.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the system to be retrieved
 * @returns {EyevinnIntercomManager} - Service instance
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
