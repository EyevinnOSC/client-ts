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
  '/logflareinstance': {
    /** List all running logflare instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the logflare instance */
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
            PostgresBackendUrl: string;
            DbSchema?: string;
            DbEncryptionKey?: string;
            ApiKey?: string;
            PublicAccessToken?: string;
            PrivateAccessToken?: string;
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
    /** Launch a new logflare instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the logflare instance */
            name: string;
            PostgresBackendUrl: string;
            DbSchema?: string;
            DbEncryptionKey?: string;
            ApiKey?: string;
            PublicAccessToken?: string;
            PrivateAccessToken?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the logflare instance */
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
            PostgresBackendUrl: string;
            DbSchema?: string;
            DbEncryptionKey?: string;
            ApiKey?: string;
            PublicAccessToken?: string;
            PrivateAccessToken?: string;
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
  '/logflareinstance/{id}': {
    /** Obtain status and resource URLs for an logflare instance */
    get: {
      parameters: {
        path: {
          /** Name of the logflare instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the logflare instance */
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
            PostgresBackendUrl: string;
            DbSchema?: string;
            DbEncryptionKey?: string;
            ApiKey?: string;
            PublicAccessToken?: string;
            PrivateAccessToken?: string;
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
    /** Stop and remove an logflare instance */
    delete: {
      parameters: {
        path: {
          /** Name of the logflare instance */
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
    /** Return status of logflare instance */
    get: {
      parameters: {
        path: {
          /** Name of the logflare instance */
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
    /** Return the latest logs from the logflare instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the logflare instance */
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
    /** Return the exposed extra ports for logflare instance */
    get: {
      parameters: {
        path: {
          /** Name of the logflare instance */
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

export type LogflareLogflare =
  paths['/logflareinstance/{id}']['get']['responses']['200']['schema'];

export type LogflareLogflareConfig =
  paths['/logflareinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace logflare-logflare
 * @description Streamline your log management with Logflare! Integrate effortlessly, visualize in your browser, and leverage your existing BigQuery setup for seamless data insights. Elevate logging today!
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://docs.osaas.io/osaas.wiki/Service:-Logflare.html|Online docs} for further information
 */

/**
 * @typedef {Object} LogflareLogflareConfig
 * @property {string} name - Name of logflare
 * @property {string} PostgresBackendUrl - PostgresBackendUrl
 * @property {string} [DbSchema] - DbSchema
 * @property {string} [DbEncryptionKey] - DbEncryptionKey
 * @property {string} [ApiKey] - ApiKey
 * @property {string} [PublicAccessToken] - PublicAccessToken
 * @property {string} [PrivateAccessToken] - PrivateAccessToken

 * 
 */

/**
 * @typedef {Object} LogflareLogflare
 * @property {string} name - Name of the Logflare instance
 * @property {string} url - URL of the Logflare instance
 *
 */

/**
 * Create a new Logflare instance
 *
 * @memberOf logflare-logflare
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {LogflareLogflareConfig} body - Service instance configuration
 * @returns {LogflareLogflare} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createLogflareLogflareInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: LogflareLogflareConfig = { name: 'myinstance', ... };
 * const instance = await createLogflareLogflareInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createLogflareLogflareInstance(
  ctx: Context,
  body: LogflareLogflareConfig
): Promise<LogflareLogflare> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'logflare-logflare'
  );
  const instance = await createInstance(
    ctx,
    'logflare-logflare',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('logflare-logflare', instance.name, ctx);
  return instance;
}

/**
 * Remove a Logflare instance
 *
 * @memberOf logflare-logflare
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the logflare to be removed
 */
export async function removeLogflareLogflareInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'logflare-logflare'
  );
  await removeInstance(ctx, 'logflare-logflare', name, serviceAccessToken);
}

/**
 * Get a Logflare instance
 *
 * @memberOf logflare-logflare
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the logflare to be retrieved
 * @returns {LogflareLogflare} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getLogflareLogflareInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getLogflareLogflareInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getLogflareLogflareInstance(
  ctx: Context,
  name: string
): Promise<LogflareLogflare> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'logflare-logflare'
  );
  return await getInstance(ctx, 'logflare-logflare', name, serviceAccessToken);
}
