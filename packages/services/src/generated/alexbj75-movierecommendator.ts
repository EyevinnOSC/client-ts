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
  '/movierecommendatorinstance': {
    /** List all running movierecommendator instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the movierecommendator instance */
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
            OpenAiKey: string;
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
    /** Launch a new movierecommendator instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the movierecommendator instance */
            name: string;
            OpenAiKey: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the movierecommendator instance */
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
            OpenAiKey: string;
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
  '/movierecommendatorinstance/{id}': {
    /** Obtain status and resource URLs for an movierecommendator instance */
    get: {
      parameters: {
        path: {
          /** Name of the movierecommendator instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the movierecommendator instance */
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
            OpenAiKey: string;
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
    /** Stop and remove an movierecommendator instance */
    delete: {
      parameters: {
        path: {
          /** Name of the movierecommendator instance */
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
    /** Return status of movierecommendator instance */
    get: {
      parameters: {
        path: {
          /** Name of the movierecommendator instance */
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
    /** Return the latest logs from the movierecommendator instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the movierecommendator instance */
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
    /** Return the exposed extra ports for movierecommendator instance */
    get: {
      parameters: {
        path: {
          /** Name of the movierecommendator instance */
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

export type Alexbj75Movierecommendator =
  paths['/movierecommendatorinstance/{id}']['get']['responses']['200']['schema'];

export type Alexbj75MovierecommendatorConfig =
  paths['/movierecommendatorinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace alexbj75-movierecommendator
 * @description Discover new films effortlessly! Enter a movie name and get two personalized recommendations powered by OpenAI. Transform your movie nights with Movie Recommender’s smart suggestions. Try it now!
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} Alexbj75MovierecommendatorConfig
 * @property {string} name - Name of movierecommendator
 * @property {string} OpenAiKey - Open AI Api Key

 * 
 */

/**
 * @typedef {Object} Alexbj75Movierecommendator
 * @property {string} name - Name of the movierecommendator instance
 * @property {string} url - URL of the movierecommendator instance
 *
 */

/**
 * Create a new movierecommendator instance
 *
 * @memberOf alexbj75-movierecommendator
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {Alexbj75MovierecommendatorConfig} body - Service instance configuration
 * @returns {Alexbj75Movierecommendator} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createAlexbj75MovierecommendatorInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: Alexbj75MovierecommendatorConfig = { name: 'myinstance', ... };
 * const instance = await createAlexbj75MovierecommendatorInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createAlexbj75MovierecommendatorInstance(
  ctx: Context,
  body: Alexbj75MovierecommendatorConfig
): Promise<Alexbj75Movierecommendator> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'alexbj75-movierecommendator'
  );
  const instance = await createInstance(
    ctx,
    'alexbj75-movierecommendator',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('alexbj75-movierecommendator', instance.name, ctx);
  return instance;
}

/**
 * Remove a movierecommendator instance
 *
 * @memberOf alexbj75-movierecommendator
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the movierecommendator to be removed
 */
export async function removeAlexbj75MovierecommendatorInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'alexbj75-movierecommendator'
  );
  await removeInstance(
    ctx,
    'alexbj75-movierecommendator',
    name,
    serviceAccessToken
  );
}

/**
 * Get a movierecommendator instance
 *
 * @memberOf alexbj75-movierecommendator
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the movierecommendator to be retrieved
 * @returns {Alexbj75Movierecommendator} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getAlexbj75MovierecommendatorInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getAlexbj75MovierecommendatorInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getAlexbj75MovierecommendatorInstance(
  ctx: Context,
  name: string
): Promise<Alexbj75Movierecommendator> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'alexbj75-movierecommendator'
  );
  return await getInstance(
    ctx,
    'alexbj75-movierecommendator',
    name,
    serviceAccessToken
  );
}
