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
  '/analyticsinstance': {
    /** List all running analytics instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the analytics instance */
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
            PostgreSQLUrl: string;
            ClickHouseDbUrl: string;
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
    /** Launch a new analytics instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the analytics instance */
            name: string;
            PostgreSQLUrl: string;
            ClickHouseDbUrl: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the analytics instance */
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
            PostgreSQLUrl: string;
            ClickHouseDbUrl: string;
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
  '/analyticsinstance/{id}': {
    /** Obtain status and resource URLs for an analytics instance */
    get: {
      parameters: {
        path: {
          /** Name of the analytics instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the analytics instance */
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
            PostgreSQLUrl: string;
            ClickHouseDbUrl: string;
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
    /** Stop and remove an analytics instance */
    delete: {
      parameters: {
        path: {
          /** Name of the analytics instance */
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
    /** Return status of analytics instance */
    get: {
      parameters: {
        path: {
          /** Name of the analytics instance */
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
    /** Return the latest logs from the analytics instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the analytics instance */
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
    /** Return the exposed extra ports for analytics instance */
    get: {
      parameters: {
        path: {
          /** Name of the analytics instance */
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

export type PlausibleAnalytics =
  paths['/analyticsinstance/{id}']['get']['responses']['200']['schema'];

export type PlausibleAnalyticsConfig =
  paths['/analyticsinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace plausible-analytics
 * @description Elevate your data privacy with Plausible Analytics. Get simple, clutter-free insights without compromising user privacy. Enjoy an easy, lightweight, and privacy-focused Google Analytics alternative!
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} PlausibleAnalyticsConfig
 * @property {string} name - Name of analytics
 * @property {string} PostgreSQLUrl - PostgreSQLUrl
 * @property {string} ClickHouseDbUrl - ClickHouseDbUrl

 * 
 */

/**
 * @typedef {Object} PlausibleAnalytics
 * @property {string} name - Name of the Plausible Analytics instance
 * @property {string} url - URL of the Plausible Analytics instance
 *
 */

/**
 * Create a new Plausible Analytics instance
 *
 * @memberOf plausible-analytics
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {PlausibleAnalyticsConfig} body - Service instance configuration
 * @returns {PlausibleAnalytics} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createPlausibleAnalyticsInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: PlausibleAnalyticsConfig = { name: 'myinstance', ... };
 * const instance = await createPlausibleAnalyticsInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createPlausibleAnalyticsInstance(
  ctx: Context,
  body: PlausibleAnalyticsConfig
): Promise<PlausibleAnalytics> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'plausible-analytics'
  );
  const instance = await createInstance(
    ctx,
    'plausible-analytics',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('plausible-analytics', instance.name, ctx);
  return instance;
}

/**
 * Remove a Plausible Analytics instance
 *
 * @memberOf plausible-analytics
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the server to be removed
 */
export async function removePlausibleAnalyticsInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'plausible-analytics'
  );
  await removeInstance(ctx, 'plausible-analytics', name, serviceAccessToken);
}

/**
 * Get a Plausible Analytics instance
 *
 * @memberOf plausible-analytics
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the server to be retrieved
 * @returns {PlausibleAnalytics} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getPlausibleAnalyticsInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getPlausibleAnalyticsInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getPlausibleAnalyticsInstance(
  ctx: Context,
  name: string
): Promise<PlausibleAnalytics> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'plausible-analytics'
  );
  return await getInstance(
    ctx,
    'plausible-analytics',
    name,
    serviceAccessToken
  );
}
