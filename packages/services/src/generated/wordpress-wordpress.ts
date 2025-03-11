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
  '/wordpressinstance': {
    /** List all running wordpress instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the wordpress instance */
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
            DbHost: string;
            DbUser: string;
            DbPassword: string;
            DbName?: string;
            DbTablePrefix?: string;
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
    /** Launch a new wordpress instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the wordpress instance */
            name: string;
            DbHost: string;
            DbUser: string;
            DbPassword: string;
            DbName?: string;
            DbTablePrefix?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the wordpress instance */
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
            DbHost: string;
            DbUser: string;
            DbPassword: string;
            DbName?: string;
            DbTablePrefix?: string;
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
  '/wordpressinstance/{id}': {
    /** Obtain status and resource URLs for an wordpress instance */
    get: {
      parameters: {
        path: {
          /** Name of the wordpress instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the wordpress instance */
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
            DbHost: string;
            DbUser: string;
            DbPassword: string;
            DbName?: string;
            DbTablePrefix?: string;
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
    /** Stop and remove an wordpress instance */
    delete: {
      parameters: {
        path: {
          /** Name of the wordpress instance */
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
    /** Return status of wordpress instance */
    get: {
      parameters: {
        path: {
          /** Name of the wordpress instance */
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
    /** Return the latest logs from the wordpress instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the wordpress instance */
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
    /** Return the exposed extra ports for wordpress instance */
    get: {
      parameters: {
        path: {
          /** Name of the wordpress instance */
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

export type WordpressWordpress =
  paths['/wordpressinstance/{id}']['get']['responses']['200']['schema'];

export type WordpressWordpressConfig =
  paths['/wordpressinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace wordpress-wordpress
 * @description Power your site with WordPress – the core behind 40% of the web. Enjoy seamless installation, robust customization, and unmatched scalability. Elevate your online presence effortlessly today!
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://docs.osaas.io/osaas.wiki/Service:-Wordpress.html|Online docs} for further information
 */

/**
 * @typedef {Object} WordpressWordpressConfig
 * @property {string} name - Name of wordpress
 * @property {string} DbHost - DbHost
 * @property {string} DbUser - DbUser
 * @property {string} DbPassword - DbPassword
 * @property {string} [DbName] - DbName
 * @property {string} [DbTablePrefix] - DbTablePrefix

 * 
 */

/**
 * @typedef {Object} WordpressWordpress
 * @property {string} name - Name of the Wordpress instance
 * @property {string} url - URL of the Wordpress instance
 *
 */

/**
 * Create a new Wordpress instance
 *
 * @memberOf wordpress-wordpress
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {WordpressWordpressConfig} body - Service instance configuration
 * @returns {WordpressWordpress} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createWordpressWordpressInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: WordpressWordpressConfig = { name: 'myinstance', ... };
 * const instance = await createWordpressWordpressInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createWordpressWordpressInstance(
  ctx: Context,
  body: WordpressWordpressConfig
): Promise<WordpressWordpress> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'wordpress-wordpress'
  );
  const instance = await createInstance(
    ctx,
    'wordpress-wordpress',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('wordpress-wordpress', instance.name, ctx);
  return instance;
}

/**
 * Remove a Wordpress instance
 *
 * @memberOf wordpress-wordpress
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the wordpress to be removed
 */
export async function removeWordpressWordpressInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'wordpress-wordpress'
  );
  await removeInstance(ctx, 'wordpress-wordpress', name, serviceAccessToken);
}

/**
 * Get a Wordpress instance
 *
 * @memberOf wordpress-wordpress
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the wordpress to be retrieved
 * @returns {WordpressWordpress} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getWordpressWordpressInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getWordpressWordpressInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getWordpressWordpressInstance(
  ctx: Context,
  name: string
): Promise<WordpressWordpress> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'wordpress-wordpress'
  );
  return await getInstance(
    ctx,
    'wordpress-wordpress',
    name,
    serviceAccessToken
  );
}
