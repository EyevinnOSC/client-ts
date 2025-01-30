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
  '/nodecatinstance': {
    /** List all running nodecat instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the nodecat instance */
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
            SigningKey?: string;
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
    /** Launch a new nodecat instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the nodecat instance */
            name: string;
            SigningKey?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the nodecat instance */
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
            SigningKey?: string;
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
  '/nodecatinstance/{id}': {
    /** Obtain status and resource URLs for an nodecat instance */
    get: {
      parameters: {
        path: {
          /** Name of the nodecat instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the nodecat instance */
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
            SigningKey?: string;
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
    /** Stop and remove an nodecat instance */
    delete: {
      parameters: {
        path: {
          /** Name of the nodecat instance */
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
    /** Return status of nodecat instance */
    get: {
      parameters: {
        path: {
          /** Name of the nodecat instance */
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
    /** Return the latest logs from the nodecat instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the nodecat instance */
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
    /** Return the exposed extra ports for nodecat instance */
    get: {
      parameters: {
        path: {
          /** Name of the nodecat instance */
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

export type AndersnasNodecat =
  paths['/nodecatinstance/{id}']['get']['responses']['200']['schema'];

export type AndersnasNodecatConfig =
  paths['/nodecatinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace andersnas-nodecat
 * @description Enhance your app's security with NodeCat, a robust solution for generating and validating Common Access Tokens in a NodeJS environment. Ideal for developers needing reliable token management.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} AndersnasNodecatConfig
 * @property {string} name - Name of nodecat
 * @property {string} SigningKey - SigningKey

 * 
 */

/**
 * @typedef {Object} AndersnasNodecat
 * @property {string} name - Name of the NodeCat instance
 * @property {string} url - URL of the NodeCat instance
 *
 */

/**
 * Create a new NodeCat instance
 *
 * @memberOf andersnas-nodecat
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {AndersnasNodecatConfig} body - Service instance configuration
 * @returns {AndersnasNodecat} - Service instance
 * @example
 * import { Context, createAndersnasNodecatInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createAndersnasNodecatInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createAndersnasNodecatInstance(
  ctx: Context,
  body: AndersnasNodecatConfig
): Promise<AndersnasNodecat> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'andersnas-nodecat'
  );
  const instance = await createInstance(
    ctx,
    'andersnas-nodecat',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('andersnas-nodecat', instance.name, ctx);
  return instance;
}

/**
 * Remove a NodeCat instance
 *
 * @memberOf andersnas-nodecat
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the nodecat to be removed
 */
export async function removeAndersnasNodecatInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'andersnas-nodecat'
  );
  await removeInstance(ctx, 'andersnas-nodecat', name, serviceAccessToken);
}

/**
 * Get a NodeCat instance
 *
 * @memberOf andersnas-nodecat
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the nodecat to be retrieved
 * @returns {AndersnasNodecat} - Service instance
 */
export async function getAndersnasNodecatInstance(
  ctx: Context,
  name: string
): Promise<AndersnasNodecat> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'andersnas-nodecat'
  );
  return await getInstance(ctx, 'andersnas-nodecat', name, serviceAccessToken);
}
