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
  '/searxnginstance': {
    /** List all running searxng instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the searxng instance */
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
            AutoComplete?: string;
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
    /** Launch a new searxng instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the searxng instance */
            name: string;
            AutoComplete?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the searxng instance */
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
            AutoComplete?: string;
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
  '/searxnginstance/{id}': {
    /** Obtain status and resource URLs for an searxng instance */
    get: {
      parameters: {
        path: {
          /** Name of the searxng instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the searxng instance */
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
            AutoComplete?: string;
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
    /** Stop and remove an searxng instance */
    delete: {
      parameters: {
        path: {
          /** Name of the searxng instance */
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
    /** Return status of searxng instance */
    get: {
      parameters: {
        path: {
          /** Name of the searxng instance */
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
    /** Return the latest logs from the searxng instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the searxng instance */
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
    /** Return the exposed extra ports for searxng instance */
    get: {
      parameters: {
        path: {
          /** Name of the searxng instance */
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

export type SearxngSearxng =
  paths['/searxnginstance/{id}']['get']['responses']['200']['schema'];

export type SearxngSearxngConfig =
  paths['/searxnginstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace searxng-searxng
 * @description Experience the power of privacy with SearXNG, a customizable metasearch engine delivering unmatched confidentiality. Explore the web securely with our easy setup and extensive admin tools.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} SearxngSearxngConfig
 * @property {string} name - Name of searxng
 * @property {string} [AutoComplete] - AutoComplete

 * 
 */

/**
 * @typedef {Object} SearxngSearxng
 * @property {string} name - Name of the SearXNG instance
 * @property {string} url - URL of the SearXNG instance
 *
 */

/**
 * Create a new SearXNG instance
 *
 * @memberOf searxng-searxng
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {SearxngSearxngConfig} body - Service instance configuration
 * @returns {SearxngSearxng} - Service instance
 * @example
 * import { Context, createSearxngSearxngInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createSearxngSearxngInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createSearxngSearxngInstance(
  ctx: Context,
  body: SearxngSearxngConfig
): Promise<SearxngSearxng> {
  const serviceAccessToken = await ctx.getServiceAccessToken('searxng-searxng');
  const instance = await createInstance(
    ctx,
    'searxng-searxng',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('searxng-searxng', instance.name, ctx);
  return instance;
}

/**
 * Remove a SearXNG instance
 *
 * @memberOf searxng-searxng
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the searxng to be removed
 */
export async function removeSearxngSearxngInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken('searxng-searxng');
  await removeInstance(ctx, 'searxng-searxng', name, serviceAccessToken);
}

/**
 * Get a SearXNG instance
 *
 * @memberOf searxng-searxng
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the searxng to be retrieved
 * @returns {SearxngSearxng} - Service instance
 */
export async function getSearxngSearxngInstance(
  ctx: Context,
  name: string
): Promise<SearxngSearxng> {
  const serviceAccessToken = await ctx.getServiceAccessToken('searxng-searxng');
  return await getInstance(ctx, 'searxng-searxng', name, serviceAccessToken);
}
