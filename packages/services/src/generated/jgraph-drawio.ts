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
  '/drawioinstance': {
    /** List all running drawio instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the drawio instance */
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
    /** Launch a new drawio instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the drawio instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the drawio instance */
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
  '/drawioinstance/{id}': {
    /** Obtain status and resource URLs for an drawio instance */
    get: {
      parameters: {
        path: {
          /** Name of the drawio instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the drawio instance */
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
    /** Stop and remove an drawio instance */
    delete: {
      parameters: {
        path: {
          /** Name of the drawio instance */
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
    /** Return status of drawio instance */
    get: {
      parameters: {
        path: {
          /** Name of the drawio instance */
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
    /** Return the latest logs from the drawio instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the drawio instance */
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
    /** Return the exposed extra ports for drawio instance */
    get: {
      parameters: {
        path: {
          /** Name of the drawio instance */
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

export type JgraphDrawio =
  paths['/drawioinstance/{id}']['get']['responses']['200']['schema'];

export type JgraphDrawioConfig =
  paths['/drawioinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace jgraph-drawio
 * @description Unleash your creativity with draw.io, the ultimate diagramming tool for visual storytelling and dynamic whiteboarding. Effortlessly craft, design, and export your ideas with a seamless, intuitive interface.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} JgraphDrawioConfig
 * @property {string} name - Name of drawio

 * 
 */

/**
 * @typedef {Object} JgraphDrawio
 * @property {string} name - Name of the draw.io instance
 * @property {string} url - URL of the draw.io instance
 *
 */

/**
 * Create a new draw.io instance
 *
 * @memberOf jgraph-drawio
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {JgraphDrawioConfig} body - Service instance configuration
 * @returns {JgraphDrawio} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createJgraphDrawioInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: JgraphDrawioConfig = { name: 'myinstance', ... };
 * const instance = await createJgraphDrawioInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createJgraphDrawioInstance(
  ctx: Context,
  body: JgraphDrawioConfig
): Promise<JgraphDrawio> {
  const serviceAccessToken = await ctx.getServiceAccessToken('jgraph-drawio');
  const instance = await createInstance(
    ctx,
    'jgraph-drawio',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('jgraph-drawio', instance.name, ctx);
  return instance;
}

/**
 * Remove a draw.io instance
 *
 * @memberOf jgraph-drawio
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the editor to be removed
 */
export async function removeJgraphDrawioInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken('jgraph-drawio');
  await removeInstance(ctx, 'jgraph-drawio', name, serviceAccessToken);
}

/**
 * Get a draw.io instance
 *
 * @memberOf jgraph-drawio
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the editor to be retrieved
 * @returns {JgraphDrawio} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getJgraphDrawioInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getJgraphDrawioInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getJgraphDrawioInstance(
  ctx: Context,
  name: string
): Promise<JgraphDrawio> {
  const serviceAccessToken = await ctx.getServiceAccessToken('jgraph-drawio');
  return await getInstance(ctx, 'jgraph-drawio', name, serviceAccessToken);
}
