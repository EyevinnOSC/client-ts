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
  '/chaos-stream-proxyinstance': {
    /** List all running chaos-stream-proxy instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the chaos-stream-proxy instance */
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
            statefulmode?: boolean;
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
    /** Launch a new chaos-stream-proxy instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the chaos-stream-proxy instance */
            name: string;
            statefulmode?: boolean;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the chaos-stream-proxy instance */
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
            statefulmode?: boolean;
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
  '/chaos-stream-proxyinstance/{id}': {
    /** Obtain status and resource URLs for an chaos-stream-proxy instance */
    get: {
      parameters: {
        path: {
          /** Name of the chaos-stream-proxy instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the chaos-stream-proxy instance */
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
            statefulmode?: boolean;
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
    /** Stop and remove an chaos-stream-proxy instance */
    delete: {
      parameters: {
        path: {
          /** Name of the chaos-stream-proxy instance */
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
    /** Return status of chaos-stream-proxy instance */
    get: {
      parameters: {
        path: {
          /** Name of the chaos-stream-proxy instance */
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
    /** Return the latest logs from the chaos-stream-proxy instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the chaos-stream-proxy instance */
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
    /** Return the exposed extra ports for chaos-stream-proxy instance */
    get: {
      parameters: {
        path: {
          /** Name of the chaos-stream-proxy instance */
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

export type EyevinnChaosStreamProxy =
  paths['/chaos-stream-proxyinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnChaosStreamProxyConfig =
  paths['/chaos-stream-proxyinstance']['post']['parameters']['body']['body'];

/** @namespace eyevinn-chaos-stream-proxy */
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new Chaos Stream Proxy instance
 *
 * @memberOf eyevinn-chaos-stream-proxy
 * @description Chaos Stream Proxy is an open-source tool designed to simulate network impairments in video streaming environments. It acts as a proxy between the client and the streaming server, allowing developers and QA engineers to introduce various network conditions such as latency, jitter, and packet loss to test and improve the resilience and performance of streaming applications. This tool is crucial for ensuring a smooth streaming experience under different network scenarios, making it an invaluable asset for optimizing video delivery in real-world conditions.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnChaosStreamProxyConfig}} body - Service instance configuration
 * @returns {EyevinnChaosStreamProxy} - Service instance
 * @example
 * import { Context, createEyevinnChaosStreamProxyInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnChaosStreamProxyInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnChaosStreamProxyInstance(
  ctx: Context,
  body: EyevinnChaosStreamProxyConfig
): Promise<EyevinnChaosStreamProxy> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-chaos-stream-proxy'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-chaos-stream-proxy',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-chaos-stream-proxy', instance.name, ctx);
  return instance;
}

/**
 * Remove a Chaos Stream Proxy instance
 *
 * @memberOf eyevinn-chaos-stream-proxy
 * @description Chaos Stream Proxy is an open-source tool designed to simulate network impairments in video streaming environments. It acts as a proxy between the client and the streaming server, allowing developers and QA engineers to introduce various network conditions such as latency, jitter, and packet loss to test and improve the resilience and performance of streaming applications. This tool is crucial for ensuring a smooth streaming experience under different network scenarios, making it an invaluable asset for optimizing video delivery in real-world conditions.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the chaos-stream-proxy to be removed
 */
export async function removeEyevinnChaosStreamProxyInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-chaos-stream-proxy'
  );
  await removeInstance(
    ctx,
    'eyevinn-chaos-stream-proxy',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Chaos Stream Proxy instance
 *
 * @memberOf eyevinn-chaos-stream-proxy
 * @description Chaos Stream Proxy is an open-source tool designed to simulate network impairments in video streaming environments. It acts as a proxy between the client and the streaming server, allowing developers and QA engineers to introduce various network conditions such as latency, jitter, and packet loss to test and improve the resilience and performance of streaming applications. This tool is crucial for ensuring a smooth streaming experience under different network scenarios, making it an invaluable asset for optimizing video delivery in real-world conditions.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the chaos-stream-proxy to be retrieved
 * @returns {EyevinnChaosStreamProxy} - Service instance
 */
export async function getEyevinnChaosStreamProxyInstance(
  ctx: Context,
  name: string
): Promise<EyevinnChaosStreamProxy> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-chaos-stream-proxy'
  );
  return await getInstance(
    ctx,
    'eyevinn-chaos-stream-proxy',
    name,
    serviceAccessToken
  );
}
