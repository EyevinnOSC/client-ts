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
  '/ephtoken-svcinstance': {
    /** List all running ephtoken-svc instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the ephtoken-svc instance */
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
            OpenAiApiKey: string;
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
    /** Launch a new ephtoken-svc instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the ephtoken-svc instance */
            name: string;
            OpenAiApiKey: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the ephtoken-svc instance */
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
            OpenAiApiKey: string;
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
  '/ephtoken-svcinstance/{id}': {
    /** Obtain status and resource URLs for an ephtoken-svc instance */
    get: {
      parameters: {
        path: {
          /** Name of the ephtoken-svc instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the ephtoken-svc instance */
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
            OpenAiApiKey: string;
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
    /** Stop and remove an ephtoken-svc instance */
    delete: {
      parameters: {
        path: {
          /** Name of the ephtoken-svc instance */
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
    /** Return status of ephtoken-svc instance */
    get: {
      parameters: {
        path: {
          /** Name of the ephtoken-svc instance */
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
    /** Return the latest logs from the ephtoken-svc instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the ephtoken-svc instance */
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
    /** Return the exposed extra ports for ephtoken-svc instance */
    get: {
      parameters: {
        path: {
          /** Name of the ephtoken-svc instance */
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

export type EyevinnEphtokenSvc =
  paths['/ephtoken-svcinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnEphtokenSvcConfig =
  paths['/ephtoken-svcinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-ephtoken-svc
 * @description Seamlessly integrate with client-side apps by generating ephemeral API tokens for the OpenAI Realtime API. Simplify authentication and enhance security with this easy-to-install solution today!
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} EyevinnEphtokenSvcConfig
 * @property {string} name - Name of ephtoken-svc
 * @property {string} OpenAiApiKey - OpenAiApiKey

 * 
 */

/**
 * @typedef {Object} EyevinnEphtokenSvc
 * @property {string} name - Name of the Ephmeral Token Service instance
 * @property {string} url - URL of the Ephmeral Token Service instance
 *
 */

/**
 * Create a new Ephmeral Token Service instance
 *
 * @memberOf eyevinn-ephtoken-svc
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnEphtokenSvcConfig} body - Service instance configuration
 * @returns {EyevinnEphtokenSvc} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createEyevinnEphtokenSvcInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: EyevinnEphtokenSvcConfig = { name: 'myinstance', ... };
 * const instance = await createEyevinnEphtokenSvcInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createEyevinnEphtokenSvcInstance(
  ctx: Context,
  body: EyevinnEphtokenSvcConfig
): Promise<EyevinnEphtokenSvc> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-ephtoken-svc'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-ephtoken-svc',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-ephtoken-svc', instance.name, ctx);
  return instance;
}

/**
 * Remove a Ephmeral Token Service instance
 *
 * @memberOf eyevinn-ephtoken-svc
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the tokenservice to be removed
 */
export async function removeEyevinnEphtokenSvcInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-ephtoken-svc'
  );
  await removeInstance(ctx, 'eyevinn-ephtoken-svc', name, serviceAccessToken);
}

/**
 * Get a Ephmeral Token Service instance
 *
 * @memberOf eyevinn-ephtoken-svc
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the tokenservice to be retrieved
 * @returns {EyevinnEphtokenSvc} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getEyevinnEphtokenSvcInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getEyevinnEphtokenSvcInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getEyevinnEphtokenSvcInstance(
  ctx: Context,
  name: string
): Promise<EyevinnEphtokenSvc> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-ephtoken-svc'
  );
  return await getInstance(
    ctx,
    'eyevinn-ephtoken-svc',
    name,
    serviceAccessToken
  );
}
