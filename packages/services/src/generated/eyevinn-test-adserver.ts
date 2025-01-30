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
  '/test-adserverinstance': {
    /** List all running test-adserver instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the test-adserver instance */
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
            MrssOrigin?: string;
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
    /** Launch a new test-adserver instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the test-adserver instance */
            name: string;
            MrssOrigin?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the test-adserver instance */
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
            MrssOrigin?: string;
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
  '/test-adserverinstance/{id}': {
    /** Obtain status and resource URLs for an test-adserver instance */
    get: {
      parameters: {
        path: {
          /** Name of the test-adserver instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the test-adserver instance */
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
            MrssOrigin?: string;
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
    /** Stop and remove an test-adserver instance */
    delete: {
      parameters: {
        path: {
          /** Name of the test-adserver instance */
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
    /** Return status of test-adserver instance */
    get: {
      parameters: {
        path: {
          /** Name of the test-adserver instance */
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
    /** Return the latest logs from the test-adserver instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the test-adserver instance */
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
    /** Return the exposed extra ports for test-adserver instance */
    get: {
      parameters: {
        path: {
          /** Name of the test-adserver instance */
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

export type EyevinnTestAdserver =
  paths['/test-adserverinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnTestAdserverConfig =
  paths['/test-adserverinstance']['post']['parameters']['body']['body'];

/** @namespace eyevinn-test-adserver */
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new Test Adserver instance
 *
 * @memberOf eyevinn-test-adserver
 * @description Eyevinn Test Adserver is the ultimate solution for testing CSAI/SSAI stitching and tracking implementation. Open source, easy to use, and flexible for various use cases. Get it now and experience seamless testing!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnTestAdserverConfig}} body - Service instance configuration
 * @returns {EyevinnTestAdserver} - Service instance
 * @example
 * import { Context, createEyevinnTestAdserverInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnTestAdserverInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnTestAdserverInstance(
  ctx: Context,
  body: EyevinnTestAdserverConfig
): Promise<EyevinnTestAdserver> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-test-adserver'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-test-adserver',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-test-adserver', instance.name, ctx);
  return instance;
}

/**
 * Remove a Test Adserver instance
 *
 * @memberOf eyevinn-test-adserver
 * @description Eyevinn Test Adserver is the ultimate solution for testing CSAI/SSAI stitching and tracking implementation. Open source, easy to use, and flexible for various use cases. Get it now and experience seamless testing!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the test-adserver to be removed
 */
export async function removeEyevinnTestAdserverInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-test-adserver'
  );
  await removeInstance(ctx, 'eyevinn-test-adserver', name, serviceAccessToken);
}

/**
 * Get a Test Adserver instance
 *
 * @memberOf eyevinn-test-adserver
 * @description Eyevinn Test Adserver is the ultimate solution for testing CSAI/SSAI stitching and tracking implementation. Open source, easy to use, and flexible for various use cases. Get it now and experience seamless testing!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the test-adserver to be retrieved
 * @returns {EyevinnTestAdserver} - Service instance
 */
export async function getEyevinnTestAdserverInstance(
  ctx: Context,
  name: string
): Promise<EyevinnTestAdserver> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-test-adserver'
  );
  return await getInstance(
    ctx,
    'eyevinn-test-adserver',
    name,
    serviceAccessToken
  );
}
