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
  '/valkeyinstance': {
    /** List all running valkey instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the valkey instance */
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
    /** Launch a new valkey instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the valkey instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the valkey instance */
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
  '/valkeyinstance/{id}': {
    /** Obtain status and resource URLs for an valkey instance */
    get: {
      parameters: {
        path: {
          /** Name of the valkey instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the valkey instance */
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
    /** Stop and remove an valkey instance */
    delete: {
      parameters: {
        path: {
          /** Name of the valkey instance */
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
    /** Return status of valkey instance */
    get: {
      parameters: {
        path: {
          /** Name of the valkey instance */
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
    /** Return the latest logs from the valkey instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the valkey instance */
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
    /** Return the exposed extra ports for valkey instance */
    get: {
      parameters: {
        path: {
          /** Name of the valkey instance */
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

export type ValkeyIoValkey =
  paths['/valkeyinstance/{id}']['get']['responses']['200']['schema'];

export type ValkeyIoValkeyConfig =
  paths['/valkeyinstance']['post']['parameters']['body']['body'];

/** @namespace valkey-io-valkey */
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new valkey instance
 * 
 * @memberOf valkey-io-valkey
 * @description Introducing Valkey: a Redis-compatible high-performance key-value store with wide range support. Build on various systems, extensible plugin system, and TLS support available.

NB! Data persistence not guaranteed
 * @param {Context} context - Open Source Cloud configuration context
 * @param {ValkeyIoValkeyConfig}} body - Service instance configuration
 * @returns {ValkeyIoValkey} - Service instance
 * @example
 * import { Context, createValkeyIoValkeyInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createValkeyIoValkeyInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createValkeyIoValkeyInstance(
  ctx: Context,
  body: ValkeyIoValkeyConfig
): Promise<ValkeyIoValkey> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'valkey-io-valkey'
  );
  const instance = await createInstance(
    ctx,
    'valkey-io-valkey',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('valkey-io-valkey', instance.name, ctx);
  return instance;
}

/**
 * Remove a valkey instance
 * 
 * @memberOf valkey-io-valkey
 * @description Introducing Valkey: a Redis-compatible high-performance key-value store with wide range support. Build on various systems, extensible plugin system, and TLS support available.

NB! Data persistence not guaranteed
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the valkey to be removed
 */
export async function removeValkeyIoValkeyInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'valkey-io-valkey'
  );
  await removeInstance(ctx, 'valkey-io-valkey', name, serviceAccessToken);
}

/**
 * Get a valkey instance
 * 
 * @memberOf valkey-io-valkey
 * @description Introducing Valkey: a Redis-compatible high-performance key-value store with wide range support. Build on various systems, extensible plugin system, and TLS support available.

NB! Data persistence not guaranteed
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the valkey to be retrieved
 * @returns {ValkeyIoValkey} - Service instance
 */
export async function getValkeyIoValkeyInstance(
  ctx: Context,
  name: string
): Promise<ValkeyIoValkey> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'valkey-io-valkey'
  );
  return await getInstance(ctx, 'valkey-io-valkey', name, serviceAccessToken);
}
