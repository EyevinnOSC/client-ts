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
  '/hello-worldinstance': {
    /** List all running hello-world instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the hello-world instance */
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
            Text: string;
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
    /** Launch a new hello-world instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the hello-world instance */
            name: string;
            Text: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the hello-world instance */
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
            Text: string;
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
  '/hello-worldinstance/{id}': {
    /** Obtain status and resource URLs for an hello-world instance */
    get: {
      parameters: {
        path: {
          /** Name of the hello-world instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the hello-world instance */
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
            Text: string;
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
    /** Stop and remove an hello-world instance */
    delete: {
      parameters: {
        path: {
          /** Name of the hello-world instance */
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
    /** Return status of hello-world instance */
    get: {
      parameters: {
        path: {
          /** Name of the hello-world instance */
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
    /** Return the latest logs from the hello-world instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the hello-world instance */
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
    /** Return the exposed extra ports for hello-world instance */
    get: {
      parameters: {
        path: {
          /** Name of the hello-world instance */
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

export type ErnestocaroccaHelloWorld =
  paths['/hello-worldinstance/{id}']['get']['responses']['200']['schema'];

export type ErnestocaroccaHelloWorldConfig =
  paths['/hello-worldinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace ernestocarocca-hello-world
 * @description Harness the power of Next.js 14 and NextUI v2 with this feature-rich template. Perfect for creating sleek, dynamic apps with Tailwind CSS and TypeScript. Kickstart your project efficiently today!
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} ErnestocaroccaHelloWorldConfig
 * @property {string} name - Name of hello-world
 * @property {string} Text - Text

 * 
 */

/**
 * @typedef {Object} ErnestocaroccaHelloWorld
 * @property {string} name - Name of the Hello World instance
 * @property {string} url - URL of the Hello World instance
 *
 */

/**
 * Create a new Hello World instance
 *
 * @memberOf ernestocarocca-hello-world
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {ErnestocaroccaHelloWorldConfig} body - Service instance configuration
 * @returns {ErnestocaroccaHelloWorld} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createErnestocaroccaHelloWorldInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: ErnestocaroccaHelloWorldConfig = { name: 'myinstance', ... };
 * const instance = await createErnestocaroccaHelloWorldInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createErnestocaroccaHelloWorldInstance(
  ctx: Context,
  body: ErnestocaroccaHelloWorldConfig
): Promise<ErnestocaroccaHelloWorld> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'ernestocarocca-hello-world'
  );
  const instance = await createInstance(
    ctx,
    'ernestocarocca-hello-world',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('ernestocarocca-hello-world', instance.name, ctx);
  return instance;
}

/**
 * Remove a Hello World instance
 *
 * @memberOf ernestocarocca-hello-world
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the example to be removed
 */
export async function removeErnestocaroccaHelloWorldInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'ernestocarocca-hello-world'
  );
  await removeInstance(
    ctx,
    'ernestocarocca-hello-world',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Hello World instance
 *
 * @memberOf ernestocarocca-hello-world
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the example to be retrieved
 * @returns {ErnestocaroccaHelloWorld} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getErnestocaroccaHelloWorldInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getErnestocaroccaHelloWorldInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getErnestocaroccaHelloWorldInstance(
  ctx: Context,
  name: string
): Promise<ErnestocaroccaHelloWorld> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'ernestocarocca-hello-world'
  );
  return await getInstance(
    ctx,
    'ernestocarocca-hello-world',
    name,
    serviceAccessToken
  );
}
