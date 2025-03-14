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
  '/continue-watching-apiinstance': {
    /** List all running continue-watching-api instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the continue-watching-api instance */
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
            RedisHost: string;
            RedisPort?: string;
            RedisUsername?: string;
            RedisPassword?: string;
          }[];
        };
        /** Default Response */
        500: {
          schema: string;
        };
      };
    };
    /** Launch a new continue-watching-api instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the continue-watching-api instance */
            name: string;
            RedisHost: string;
            RedisPort?: string;
            RedisUsername?: string;
            RedisPassword?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the continue-watching-api instance */
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
            RedisHost: string;
            RedisPort?: string;
            RedisUsername?: string;
            RedisPassword?: string;
          };
        };
        /** Default Response */
        500: {
          schema: string;
        };
      };
    };
  };
  '/continue-watching-apiinstance/{id}': {
    /** Obtain status and resource URLs for an continue-watching-api instance */
    get: {
      parameters: {
        path: {
          /** Name of the continue-watching-api instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the continue-watching-api instance */
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
            RedisHost: string;
            RedisPort?: string;
            RedisUsername?: string;
            RedisPassword?: string;
          };
        };
        /** Default Response */
        404: {
          schema: string;
        };
        /** Default Response */
        500: {
          schema: string;
        };
      };
    };
    /** Stop and remove an continue-watching-api instance */
    delete: {
      parameters: {
        path: {
          /** Name of the continue-watching-api instance */
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
          schema: string;
        };
      };
    };
  };
  '/health/{id}': {
    /** Return status of continue-watching-api instance */
    get: {
      parameters: {
        path: {
          /** Name of the continue-watching-api instance */
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
          schema: string;
        };
      };
    };
  };
}

export interface definitions {}

export interface operations {}

export interface external {}

export type EyevinnContinueWatchingApi =
  paths['/continue-watching-apiinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnContinueWatchingApiConfig =
  paths['/continue-watching-apiinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-continue-watching-api
 * @description A user of a streaming service expects that they can pick up where they left on any of their devices. To handle that you would need to develop a service with endpoints for the application to write and read from. This open source cloud component take care of that and all you need is to have a Redis database running on Redis Cloud for example.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://dev.to/video/how-to-quickly-setup-a-continue-watching-endpoint-for-your-video-players-ek7|Online docs} for further information
 */

/**
 * @typedef {Object} EyevinnContinueWatchingApiConfig
 * @property {string} name - Name of continue-watching-api
 * @property {string} RedisHost - Redis Host
 * @property {string} [RedisPort] - Redis Port
 * @property {string} [RedisUsername] - Redis Username
 * @property {string} [RedisPassword] - Redis Password

 * 
 */

/**
 * @typedef {Object} EyevinnContinueWatchingApi
 * @property {string} name - Name of the Continue Watching Service instance
 * @property {string} url - URL of the Continue Watching Service instance
 *
 */

/**
 * Create a new Continue Watching Service instance
 *
 * @memberOf eyevinn-continue-watching-api
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnContinueWatchingApiConfig} body - Service instance configuration
 * @returns {EyevinnContinueWatchingApi} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createEyevinnContinueWatchingApiInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: EyevinnContinueWatchingApiConfig = { name: 'myinstance', ... };
 * const instance = await createEyevinnContinueWatchingApiInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createEyevinnContinueWatchingApiInstance(
  ctx: Context,
  body: EyevinnContinueWatchingApiConfig
): Promise<EyevinnContinueWatchingApi> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-continue-watching-api'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-continue-watching-api',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady(
    'eyevinn-continue-watching-api',
    instance.name,
    ctx
  );
  return instance;
}

/**
 * Remove a Continue Watching Service instance
 *
 * @memberOf eyevinn-continue-watching-api
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the service to be removed
 */
export async function removeEyevinnContinueWatchingApiInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-continue-watching-api'
  );
  await removeInstance(
    ctx,
    'eyevinn-continue-watching-api',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Continue Watching Service instance
 *
 * @memberOf eyevinn-continue-watching-api
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the service to be retrieved
 * @returns {EyevinnContinueWatchingApi} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getEyevinnContinueWatchingApiInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getEyevinnContinueWatchingApiInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getEyevinnContinueWatchingApiInstance(
  ctx: Context,
  name: string
): Promise<EyevinnContinueWatchingApi> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-continue-watching-api'
  );
  return await getInstance(
    ctx,
    'eyevinn-continue-watching-api',
    name,
    serviceAccessToken
  );
}
