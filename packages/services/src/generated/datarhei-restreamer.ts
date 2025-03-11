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
  '/restreamerinstance': {
    /** List all running restreamer instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the restreamer instance */
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
    /** Launch a new restreamer instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the restreamer instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the restreamer instance */
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
  '/restreamerinstance/{id}': {
    /** Obtain status and resource URLs for an restreamer instance */
    get: {
      parameters: {
        path: {
          /** Name of the restreamer instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the restreamer instance */
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
    /** Stop and remove an restreamer instance */
    delete: {
      parameters: {
        path: {
          /** Name of the restreamer instance */
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
    /** Return status of restreamer instance */
    get: {
      parameters: {
        path: {
          /** Name of the restreamer instance */
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
    /** Return the latest logs from the restreamer instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the restreamer instance */
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
    /** Return the exposed extra ports for restreamer instance */
    get: {
      parameters: {
        path: {
          /** Name of the restreamer instance */
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

export type DatarheiRestreamer =
  paths['/restreamerinstance/{id}']['get']['responses']['200']['schema'];

export type DatarheiRestreamerConfig =
  paths['/restreamerinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace datarhei-restreamer
 * @description Introducing Restreamer: A free, self-hosting solution for seamless live streaming to multiple platforms like YouTube, Twitch, and more. Easy setup, diverse features, hardware support, and GDPR compliance make it a must-have.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} DatarheiRestreamerConfig
 * @property {string} name - Name of restreamer

 * 
 */

/**
 * @typedef {Object} DatarheiRestreamer
 * @property {string} name - Name of the restreamer instance
 * @property {string} url - URL of the restreamer instance
 *
 */

/**
 * Create a new restreamer instance
 *
 * @memberOf datarhei-restreamer
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {DatarheiRestreamerConfig} body - Service instance configuration
 * @returns {DatarheiRestreamer} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createDatarheiRestreamerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: DatarheiRestreamerConfig = { name: 'myinstance', ... };
 * const instance = await createDatarheiRestreamerInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createDatarheiRestreamerInstance(
  ctx: Context,
  body: DatarheiRestreamerConfig
): Promise<DatarheiRestreamer> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'datarhei-restreamer'
  );
  const instance = await createInstance(
    ctx,
    'datarhei-restreamer',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('datarhei-restreamer', instance.name, ctx);
  return instance;
}

/**
 * Remove a restreamer instance
 *
 * @memberOf datarhei-restreamer
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the restreamer to be removed
 */
export async function removeDatarheiRestreamerInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'datarhei-restreamer'
  );
  await removeInstance(ctx, 'datarhei-restreamer', name, serviceAccessToken);
}

/**
 * Get a restreamer instance
 *
 * @memberOf datarhei-restreamer
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the restreamer to be retrieved
 * @returns {DatarheiRestreamer} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getDatarheiRestreamerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getDatarheiRestreamerInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getDatarheiRestreamerInstance(
  ctx: Context,
  name: string
): Promise<DatarheiRestreamer> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'datarhei-restreamer'
  );
  return await getInstance(
    ctx,
    'datarhei-restreamer',
    name,
    serviceAccessToken
  );
}
