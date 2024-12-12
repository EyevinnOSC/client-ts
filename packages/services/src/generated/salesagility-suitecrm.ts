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
  '/suitecrminstance': {
    /** List all running suitecrm instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the suitecrm instance */
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
    /** Launch a new suitecrm instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the suitecrm instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the suitecrm instance */
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
  '/suitecrminstance/{id}': {
    /** Obtain status and resource URLs for an suitecrm instance */
    get: {
      parameters: {
        path: {
          /** Name of the suitecrm instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the suitecrm instance */
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
    /** Stop and remove an suitecrm instance */
    delete: {
      parameters: {
        path: {
          /** Name of the suitecrm instance */
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
    /** Return status of suitecrm instance */
    get: {
      parameters: {
        path: {
          /** Name of the suitecrm instance */
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
    /** Return the latest logs from the suitecrm instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the suitecrm instance */
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
    /** Return the exposed extra ports for suitecrm instance */
    get: {
      parameters: {
        path: {
          /** Name of the suitecrm instance */
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

export type SalesagilitySuitecrm =
  paths['/suitecrminstance/{id}']['get']['responses']['200']['schema'];

export type SalesagilitySuitecrmConfig =
  paths['/suitecrminstance']['post']['parameters']['body']['body'];

import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new Suite CRM instance
 *
 * @description Transform your business with SuiteCRM 7.14.5, the leading open-source CRM. Seamlessly manage customer relationships, gain full data control, and customize your solution for an unbeatable enterprise edge!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {SalesagilitySuitecrmConfig}} body - Service instance configuration
 * @returns {SalesagilitySuitecrm} - Service instance
 * @example
 * import { Context, createSalesagilitySuitecrmInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createSalesagilitySuitecrmInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createSalesagilitySuitecrmInstance(
  ctx: Context,
  body: SalesagilitySuitecrmConfig
): Promise<SalesagilitySuitecrm> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'salesagility-suitecrm'
  );
  const instance = await createInstance(
    ctx,
    'salesagility-suitecrm',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('salesagility-suitecrm', instance.name, ctx);
  return instance;
}

/**
 * Remove a Suite CRM instance
 *
 * @description Transform your business with SuiteCRM 7.14.5, the leading open-source CRM. Seamlessly manage customer relationships, gain full data control, and customize your solution for an unbeatable enterprise edge!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the suitecrm to be removed
 */
export async function removeSalesagilitySuitecrmInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'salesagility-suitecrm'
  );
  await removeInstance(ctx, 'salesagility-suitecrm', name, serviceAccessToken);
}

/**
 * Get a Suite CRM instance
 *
 * @description Transform your business with SuiteCRM 7.14.5, the leading open-source CRM. Seamlessly manage customer relationships, gain full data control, and customize your solution for an unbeatable enterprise edge!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the suitecrm to be retrieved
 * @returns {SalesagilitySuitecrm} - Service instance
 */
export async function getSalesagilitySuitecrmInstance(
  ctx: Context,
  name: string
): Promise<SalesagilitySuitecrm> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'salesagility-suitecrm'
  );
  return await getInstance(
    ctx,
    'salesagility-suitecrm',
    name,
    serviceAccessToken
  );
}
