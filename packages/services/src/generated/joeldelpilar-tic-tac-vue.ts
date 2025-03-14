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
  '/tic-tac-vueinstance': {
    /** List all running tic-tac-vue instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the tic-tac-vue instance */
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
    /** Launch a new tic-tac-vue instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the tic-tac-vue instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the tic-tac-vue instance */
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
  '/tic-tac-vueinstance/{id}': {
    /** Obtain status and resource URLs for an tic-tac-vue instance */
    get: {
      parameters: {
        path: {
          /** Name of the tic-tac-vue instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the tic-tac-vue instance */
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
    /** Stop and remove an tic-tac-vue instance */
    delete: {
      parameters: {
        path: {
          /** Name of the tic-tac-vue instance */
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
    /** Return status of tic-tac-vue instance */
    get: {
      parameters: {
        path: {
          /** Name of the tic-tac-vue instance */
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
    /** Return the latest logs from the tic-tac-vue instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the tic-tac-vue instance */
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
    /** Return the exposed extra ports for tic-tac-vue instance */
    get: {
      parameters: {
        path: {
          /** Name of the tic-tac-vue instance */
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

export type JoeldelpilarTicTacVue =
  paths['/tic-tac-vueinstance/{id}']['get']['responses']['200']['schema'];

export type JoeldelpilarTicTacVueConfig =
  paths['/tic-tac-vueinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace joeldelpilar-tic-tac-vue
 * @description Discover Tic Tac Vue - the ultimate way to enjoy classic Tic Tac Toe! This engaging game is built with Vue 3, offering smooth gameplay and a modern user interface. Perfect for quick fun!
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} JoeldelpilarTicTacVueConfig
 * @property {string} name - Name of tic-tac-vue

 * 
 */

/**
 * @typedef {Object} JoeldelpilarTicTacVue
 * @property {string} name - Name of the Tic Tac Vue instance
 * @property {string} url - URL of the Tic Tac Vue instance
 *
 */

/**
 * Create a new Tic Tac Vue instance
 *
 * @memberOf joeldelpilar-tic-tac-vue
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {JoeldelpilarTicTacVueConfig} body - Service instance configuration
 * @returns {JoeldelpilarTicTacVue} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createJoeldelpilarTicTacVueInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: JoeldelpilarTicTacVueConfig = { name: 'myinstance', ... };
 * const instance = await createJoeldelpilarTicTacVueInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createJoeldelpilarTicTacVueInstance(
  ctx: Context,
  body: JoeldelpilarTicTacVueConfig
): Promise<JoeldelpilarTicTacVue> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'joeldelpilar-tic-tac-vue'
  );
  const instance = await createInstance(
    ctx,
    'joeldelpilar-tic-tac-vue',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('joeldelpilar-tic-tac-vue', instance.name, ctx);
  return instance;
}

/**
 * Remove a Tic Tac Vue instance
 *
 * @memberOf joeldelpilar-tic-tac-vue
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the tic-tac-vue to be removed
 */
export async function removeJoeldelpilarTicTacVueInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'joeldelpilar-tic-tac-vue'
  );
  await removeInstance(
    ctx,
    'joeldelpilar-tic-tac-vue',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Tic Tac Vue instance
 *
 * @memberOf joeldelpilar-tic-tac-vue
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the tic-tac-vue to be retrieved
 * @returns {JoeldelpilarTicTacVue} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getJoeldelpilarTicTacVueInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getJoeldelpilarTicTacVueInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getJoeldelpilarTicTacVueInstance(
  ctx: Context,
  name: string
): Promise<JoeldelpilarTicTacVue> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'joeldelpilar-tic-tac-vue'
  );
  return await getInstance(
    ctx,
    'joeldelpilar-tic-tac-vue',
    name,
    serviceAccessToken
  );
}
