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
  '/sgai-ad-proxyinstance': {
    /** List all running sgai-ad-proxy instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the sgai-ad-proxy instance */
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
            VastEndpoint: string;
            OriginUrl: string;
            InsertionMode: string;
            CouchDbEndpoint?: string;
            CouchDbTable?: string;
            CouchDbUser?: string;
            CouchDbPassword?: string;
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
    /** Launch a new sgai-ad-proxy instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the sgai-ad-proxy instance */
            name: string;
            VastEndpoint: string;
            OriginUrl: string;
            InsertionMode: string;
            CouchDbEndpoint?: string;
            CouchDbTable?: string;
            CouchDbUser?: string;
            CouchDbPassword?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the sgai-ad-proxy instance */
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
            VastEndpoint: string;
            OriginUrl: string;
            InsertionMode: string;
            CouchDbEndpoint?: string;
            CouchDbTable?: string;
            CouchDbUser?: string;
            CouchDbPassword?: string;
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
  '/sgai-ad-proxyinstance/{id}': {
    /** Obtain status and resource URLs for an sgai-ad-proxy instance */
    get: {
      parameters: {
        path: {
          /** Name of the sgai-ad-proxy instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the sgai-ad-proxy instance */
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
            VastEndpoint: string;
            OriginUrl: string;
            InsertionMode: string;
            CouchDbEndpoint?: string;
            CouchDbTable?: string;
            CouchDbUser?: string;
            CouchDbPassword?: string;
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
    /** Stop and remove an sgai-ad-proxy instance */
    delete: {
      parameters: {
        path: {
          /** Name of the sgai-ad-proxy instance */
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
    /** Return status of sgai-ad-proxy instance */
    get: {
      parameters: {
        path: {
          /** Name of the sgai-ad-proxy instance */
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
    /** Return the latest logs from the sgai-ad-proxy instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the sgai-ad-proxy instance */
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
    /** Return the exposed extra ports for sgai-ad-proxy instance */
    get: {
      parameters: {
        path: {
          /** Name of the sgai-ad-proxy instance */
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

export type EyevinnSgaiAdProxy =
  paths['/sgai-ad-proxyinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnSgaiAdProxyConfig =
  paths['/sgai-ad-proxyinstance']['post']['parameters']['body']['body'];

/** @namespace eyevinn-sgai-ad-proxy */
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new SGAI Proxy instance
 *
 * @memberOf eyevinn-sgai-ad-proxy
 * @description Boost viewer engagement with our Server-Guided Ad Insertion Proxy! Automatically embed ads into video streams with precision timing. Enhance monetization effortlessly while maintaining a seamless user experience.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnSgaiAdProxyConfig}} body - Service instance configuration
 * @returns {EyevinnSgaiAdProxy} - Service instance
 * @example
 * import { Context, createEyevinnSgaiAdProxyInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnSgaiAdProxyInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnSgaiAdProxyInstance(
  ctx: Context,
  body: EyevinnSgaiAdProxyConfig
): Promise<EyevinnSgaiAdProxy> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-sgai-ad-proxy'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-sgai-ad-proxy',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-sgai-ad-proxy', instance.name, ctx);
  return instance;
}

/**
 * Remove a SGAI Proxy instance
 *
 * @memberOf eyevinn-sgai-ad-proxy
 * @description Boost viewer engagement with our Server-Guided Ad Insertion Proxy! Automatically embed ads into video streams with precision timing. Enhance monetization effortlessly while maintaining a seamless user experience.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the proxy to be removed
 */
export async function removeEyevinnSgaiAdProxyInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-sgai-ad-proxy'
  );
  await removeInstance(ctx, 'eyevinn-sgai-ad-proxy', name, serviceAccessToken);
}

/**
 * Get a SGAI Proxy instance
 *
 * @memberOf eyevinn-sgai-ad-proxy
 * @description Boost viewer engagement with our Server-Guided Ad Insertion Proxy! Automatically embed ads into video streams with precision timing. Enhance monetization effortlessly while maintaining a seamless user experience.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the proxy to be retrieved
 * @returns {EyevinnSgaiAdProxy} - Service instance
 */
export async function getEyevinnSgaiAdProxyInstance(
  ctx: Context,
  name: string
): Promise<EyevinnSgaiAdProxy> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-sgai-ad-proxy'
  );
  return await getInstance(
    ctx,
    'eyevinn-sgai-ad-proxy',
    name,
    serviceAccessToken
  );
}
