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
  '/clickhouseinstance': {
    /** List all running clickhouse instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the clickhouse instance */
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
            Db?: string;
            User?: string;
            Password?: string;
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
    /** Launch a new clickhouse instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the clickhouse instance */
            name: string;
            Db?: string;
            User?: string;
            Password?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the clickhouse instance */
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
            Db?: string;
            User?: string;
            Password?: string;
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
  '/clickhouseinstance/{id}': {
    /** Obtain status and resource URLs for an clickhouse instance */
    get: {
      parameters: {
        path: {
          /** Name of the clickhouse instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the clickhouse instance */
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
            Db?: string;
            User?: string;
            Password?: string;
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
    /** Stop and remove an clickhouse instance */
    delete: {
      parameters: {
        path: {
          /** Name of the clickhouse instance */
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
    /** Return status of clickhouse instance */
    get: {
      parameters: {
        path: {
          /** Name of the clickhouse instance */
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
    /** Return the latest logs from the clickhouse instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the clickhouse instance */
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
    /** Return the exposed extra ports for clickhouse instance */
    get: {
      parameters: {
        path: {
          /** Name of the clickhouse instance */
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

export type ClickhouseClickhouse =
  paths['/clickhouseinstance/{id}']['get']['responses']['200']['schema'];

export type ClickhouseClickhouseConfig =
  paths['/clickhouseinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace clickhouse-clickhouse
 * @description Unlock real-time data insights effortlessly with ClickHouse, the lightning-fast, open-source columnar database. Elevate your analytics and make data-driven decisions with speed and precision like never before!
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://docs.osaas.io/osaas.wiki/Service:-ClickHouse.html|Online docs} for further information
 */

/**
 * @typedef {Object} ClickhouseClickhouseConfig
 * @property {string} name - Name of clickhouse
 * @property {string} [Db] - Db
 * @property {string} [User] - User
 * @property {string} [Password] - Password

 * 
 */

/**
 * @typedef {Object} ClickhouseClickhouse
 * @property {string} name - Name of the ClickHouse Server instance
 * @property {string} url - URL of the ClickHouse Server instance
 *
 */

/**
 * Create a new ClickHouse Server instance
 *
 * @memberOf clickhouse-clickhouse
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {ClickhouseClickhouseConfig} body - Service instance configuration
 * @returns {ClickhouseClickhouse} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createClickhouseClickhouseInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: ClickhouseClickhouseConfig = { name: 'myinstance', ... };
 * const instance = await createClickhouseClickhouseInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createClickhouseClickhouseInstance(
  ctx: Context,
  body: ClickhouseClickhouseConfig
): Promise<ClickhouseClickhouse> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'clickhouse-clickhouse'
  );
  const instance = await createInstance(
    ctx,
    'clickhouse-clickhouse',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('clickhouse-clickhouse', instance.name, ctx);
  return instance;
}

/**
 * Remove a ClickHouse Server instance
 *
 * @memberOf clickhouse-clickhouse
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the clickhouse-server to be removed
 */
export async function removeClickhouseClickhouseInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'clickhouse-clickhouse'
  );
  await removeInstance(ctx, 'clickhouse-clickhouse', name, serviceAccessToken);
}

/**
 * Get a ClickHouse Server instance
 *
 * @memberOf clickhouse-clickhouse
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the clickhouse-server to be retrieved
 * @returns {ClickhouseClickhouse} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getClickhouseClickhouseInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getClickhouseClickhouseInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getClickhouseClickhouseInstance(
  ctx: Context,
  name: string
): Promise<ClickhouseClickhouse> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'clickhouse-clickhouse'
  );
  return await getInstance(
    ctx,
    'clickhouse-clickhouse',
    name,
    serviceAccessToken
  );
}
