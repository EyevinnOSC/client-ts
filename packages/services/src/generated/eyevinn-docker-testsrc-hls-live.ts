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
  '/docker-testsrc-hls-liveinstance': {
    /** List all running docker-testsrc-hls-live instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the docker-testsrc-hls-live instance */
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
    /** Launch a new docker-testsrc-hls-live instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the docker-testsrc-hls-live instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the docker-testsrc-hls-live instance */
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
  '/docker-testsrc-hls-liveinstance/{id}': {
    /** Obtain status and resource URLs for an docker-testsrc-hls-live instance */
    get: {
      parameters: {
        path: {
          /** Name of the docker-testsrc-hls-live instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the docker-testsrc-hls-live instance */
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
    /** Stop and remove an docker-testsrc-hls-live instance */
    delete: {
      parameters: {
        path: {
          /** Name of the docker-testsrc-hls-live instance */
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
    /** Return status of docker-testsrc-hls-live instance */
    get: {
      parameters: {
        path: {
          /** Name of the docker-testsrc-hls-live instance */
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
    /** Return the latest logs from the docker-testsrc-hls-live instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the docker-testsrc-hls-live instance */
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
    /** Return the exposed extra ports for docker-testsrc-hls-live instance */
    get: {
      parameters: {
        path: {
          /** Name of the docker-testsrc-hls-live instance */
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

export type EyevinnDockerTestsrcHlsLive =
  paths['/docker-testsrc-hls-liveinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnDockerTestsrcHlsLiveConfig =
  paths['/docker-testsrc-hls-liveinstance']['post']['parameters']['body']['body'];

/** @namespace eyevinn-docker-testsrc-hls-live */
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new Test Source HLS Live instance
 *
 * @memberOf eyevinn-docker-testsrc-hls-live
 * @description Effortlessly create live HLS test streams with the docker-testsrc-hls-live image. Powered by FFmpeg, it's a must-have for developers crafting and testing video applications in real-time streaming environments.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnDockerTestsrcHlsLiveConfig}} body - Service instance configuration
 * @returns {EyevinnDockerTestsrcHlsLive} - Service instance
 * @example
 * import { Context, createEyevinnDockerTestsrcHlsLiveInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnDockerTestsrcHlsLiveInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnDockerTestsrcHlsLiveInstance(
  ctx: Context,
  body: EyevinnDockerTestsrcHlsLiveConfig
): Promise<EyevinnDockerTestsrcHlsLive> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-docker-testsrc-hls-live'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-docker-testsrc-hls-live',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady(
    'eyevinn-docker-testsrc-hls-live',
    instance.name,
    ctx
  );
  return instance;
}

/**
 * Remove a Test Source HLS Live instance
 *
 * @memberOf eyevinn-docker-testsrc-hls-live
 * @description Effortlessly create live HLS test streams with the docker-testsrc-hls-live image. Powered by FFmpeg, it's a must-have for developers crafting and testing video applications in real-time streaming environments.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the testsource to be removed
 */
export async function removeEyevinnDockerTestsrcHlsLiveInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-docker-testsrc-hls-live'
  );
  await removeInstance(
    ctx,
    'eyevinn-docker-testsrc-hls-live',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Test Source HLS Live instance
 *
 * @memberOf eyevinn-docker-testsrc-hls-live
 * @description Effortlessly create live HLS test streams with the docker-testsrc-hls-live image. Powered by FFmpeg, it's a must-have for developers crafting and testing video applications in real-time streaming environments.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the testsource to be retrieved
 * @returns {EyevinnDockerTestsrcHlsLive} - Service instance
 */
export async function getEyevinnDockerTestsrcHlsLiveInstance(
  ctx: Context,
  name: string
): Promise<EyevinnDockerTestsrcHlsLive> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-docker-testsrc-hls-live'
  );
  return await getInstance(
    ctx,
    'eyevinn-docker-testsrc-hls-live',
    name,
    serviceAccessToken
  );
}
