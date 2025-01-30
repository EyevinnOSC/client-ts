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
  '/encore-callback-listenerinstance': {
    /** List all running encore-callback-listener instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the encore-callback-listener instance */
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
            RedisUrl: string;
            EncoreUrl: string;
            RedisQueue?: string;
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
    /** Launch a new encore-callback-listener instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the encore-callback-listener instance */
            name: string;
            RedisUrl: string;
            EncoreUrl: string;
            RedisQueue?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the encore-callback-listener instance */
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
            RedisUrl: string;
            EncoreUrl: string;
            RedisQueue?: string;
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
  '/encore-callback-listenerinstance/{id}': {
    /** Obtain status and resource URLs for an encore-callback-listener instance */
    get: {
      parameters: {
        path: {
          /** Name of the encore-callback-listener instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the encore-callback-listener instance */
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
            RedisUrl: string;
            EncoreUrl: string;
            RedisQueue?: string;
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
    /** Stop and remove an encore-callback-listener instance */
    delete: {
      parameters: {
        path: {
          /** Name of the encore-callback-listener instance */
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
    /** Return status of encore-callback-listener instance */
    get: {
      parameters: {
        path: {
          /** Name of the encore-callback-listener instance */
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
    /** Return the latest logs from the encore-callback-listener instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the encore-callback-listener instance */
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
    /** Return the exposed extra ports for encore-callback-listener instance */
    get: {
      parameters: {
        path: {
          /** Name of the encore-callback-listener instance */
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

export type EyevinnEncoreCallbackListener =
  paths['/encore-callback-listenerinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnEncoreCallbackListenerConfig =
  paths['/encore-callback-listenerinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-encore-callback-listener
 * @description Encore callback listener is a powerful HTTP server that listens for successful job callbacks, posting jobId and Url on a redis queue. Fully customizable with environment variables. Enhance your project efficiency now! Contact sales@eyevinn.se for further details.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} EyevinnEncoreCallbackListenerConfig
 * @property {string} name - Name of encore-callback-listener
 * @property {string} RedisUrl - RedisUrl
 * @property {string} EncoreUrl - EncoreUrl
 * @property {string | undefined} RedisQueue - RedisQueue

 * 
 */

/**
 * @typedef {Object} EyevinnEncoreCallbackListener
 * @property {string} name - Name of the Encore Callback Listener instance
 * @property {string} url - URL of the Encore Callback Listener instance
 *
 */

/**
 * Create a new Encore Callback Listener instance
 *
 * @memberOf eyevinn-encore-callback-listener
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnEncoreCallbackListenerConfig} body - Service instance configuration
 * @returns {EyevinnEncoreCallbackListener} - Service instance
 * @example
 * import { Context, createEyevinnEncoreCallbackListenerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnEncoreCallbackListenerInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnEncoreCallbackListenerInstance(
  ctx: Context,
  body: EyevinnEncoreCallbackListenerConfig
): Promise<EyevinnEncoreCallbackListener> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-encore-callback-listener'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-encore-callback-listener',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady(
    'eyevinn-encore-callback-listener',
    instance.name,
    ctx
  );
  return instance;
}

/**
 * Remove a Encore Callback Listener instance
 *
 * @memberOf eyevinn-encore-callback-listener
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the callback to be removed
 */
export async function removeEyevinnEncoreCallbackListenerInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-encore-callback-listener'
  );
  await removeInstance(
    ctx,
    'eyevinn-encore-callback-listener',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Encore Callback Listener instance
 *
 * @memberOf eyevinn-encore-callback-listener
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the callback to be retrieved
 * @returns {EyevinnEncoreCallbackListener} - Service instance
 */
export async function getEyevinnEncoreCallbackListenerInstance(
  ctx: Context,
  name: string
): Promise<EyevinnEncoreCallbackListener> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-encore-callback-listener'
  );
  return await getInstance(
    ctx,
    'eyevinn-encore-callback-listener',
    name,
    serviceAccessToken
  );
}
