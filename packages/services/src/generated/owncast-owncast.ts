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
  '/owncastinstance': {
    /** List all running owncast instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the owncast instance */
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
          schema: string;
        };
      };
    };
    /** Launch a new owncast instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the owncast instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the owncast instance */
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
        500: {
          schema: string;
        };
      };
    };
  };
  '/owncastinstance/{id}': {
    /** Obtain status and resource URLs for an owncast instance */
    get: {
      parameters: {
        path: {
          /** Name of the owncast instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the owncast instance */
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
          schema: string;
        };
        /** Default Response */
        500: {
          schema: string;
        };
      };
    };
    /** Stop and remove an owncast instance */
    delete: {
      parameters: {
        path: {
          /** Name of the owncast instance */
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
    /** Return status of owncast instance */
    get: {
      parameters: {
        path: {
          /** Name of the owncast instance */
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
  '/logs/{id}': {
    /** Return the latest logs from the owncast instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the owncast instance */
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
          schema: string;
        };
      };
    };
  };
  '/ports/{id}': {
    /** Return the exposed extra ports for owncast instance */
    get: {
      parameters: {
        path: {
          /** Name of the owncast instance */
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
          schema: string;
        };
      };
    };
  };
}

export interface definitions {}

export interface operations {}

export interface external {}

export type OwncastOwncast =
  paths['/owncastinstance/{id}']['get']['responses']['200']['schema'];

export type OwncastOwncastConfig =
  paths['/owncastinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace owncast-owncast
 * @description Revolutionize your live streaming experience with Owncast! Take control over your content, interface, and audience with this self-hosted, open-source platform. Explore the possibilities today.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://owncast.online/quickstart/configure/|Online docs} for further information
 */

/**
 * @typedef {Object} OwncastOwncastConfig
 * @property {string} name - Name of owncast

 * 
 */

/**
 * @typedef {Object} OwncastOwncast
 * @property {string} name - Name of the owncast instance
 * @property {string} url - URL of the owncast instance
 *
 */

/**
 * Create a new owncast instance
 *
 * @memberOf owncast-owncast
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {OwncastOwncastConfig} body - Service instance configuration
 * @returns {OwncastOwncast} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createOwncastOwncastInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: OwncastOwncastConfig = { name: 'myinstance', ... };
 * const instance = await createOwncastOwncastInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createOwncastOwncastInstance(
  ctx: Context,
  body: OwncastOwncastConfig
): Promise<OwncastOwncast> {
  const serviceAccessToken = await ctx.getServiceAccessToken('owncast-owncast');
  const instance = await createInstance(
    ctx,
    'owncast-owncast',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('owncast-owncast', instance.name, ctx);
  return instance;
}

/**
 * Remove a owncast instance
 *
 * @memberOf owncast-owncast
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the owncast to be removed
 */
export async function removeOwncastOwncastInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken('owncast-owncast');
  await removeInstance(ctx, 'owncast-owncast', name, serviceAccessToken);
}

/**
 * Get a owncast instance
 *
 * @memberOf owncast-owncast
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the owncast to be retrieved
 * @returns {OwncastOwncast} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getOwncastOwncastInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getOwncastOwncastInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getOwncastOwncastInstance(
  ctx: Context,
  name: string
): Promise<OwncastOwncast> {
  const serviceAccessToken = await ctx.getServiceAccessToken('owncast-owncast');
  return await getInstance(ctx, 'owncast-owncast', name, serviceAccessToken);
}
