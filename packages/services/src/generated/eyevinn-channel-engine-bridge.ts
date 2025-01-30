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
  '/channel-engine-bridgeinstance': {
    /** List all running channel-engine-bridge instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the channel-engine-bridge instance */
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
            Source: string;
            DestType: string;
            DestUrl: string;
            AwsAccessKeyId?: string;
            AwsSecretAccessKey?: string;
            AwsRegion?: string;
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
    /** Launch a new channel-engine-bridge instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the channel-engine-bridge instance */
            name: string;
            Source: string;
            DestType: string;
            DestUrl: string;
            AwsAccessKeyId?: string;
            AwsSecretAccessKey?: string;
            AwsRegion?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the channel-engine-bridge instance */
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
            Source: string;
            DestType: string;
            DestUrl: string;
            AwsAccessKeyId?: string;
            AwsSecretAccessKey?: string;
            AwsRegion?: string;
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
  '/channel-engine-bridgeinstance/{id}': {
    /** Obtain status and resource URLs for an channel-engine-bridge instance */
    get: {
      parameters: {
        path: {
          /** Name of the channel-engine-bridge instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the channel-engine-bridge instance */
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
            Source: string;
            DestType: string;
            DestUrl: string;
            AwsAccessKeyId?: string;
            AwsSecretAccessKey?: string;
            AwsRegion?: string;
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
    /** Stop and remove an channel-engine-bridge instance */
    delete: {
      parameters: {
        path: {
          /** Name of the channel-engine-bridge instance */
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
    /** Return status of channel-engine-bridge instance */
    get: {
      parameters: {
        path: {
          /** Name of the channel-engine-bridge instance */
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
    /** Return the latest logs from the channel-engine-bridge instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the channel-engine-bridge instance */
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
    /** Return the exposed extra ports for channel-engine-bridge instance */
    get: {
      parameters: {
        path: {
          /** Name of the channel-engine-bridge instance */
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

export type EyevinnChannelEngineBridge =
  paths['/channel-engine-bridgeinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnChannelEngineBridgeConfig =
  paths['/channel-engine-bridgeinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-channel-engine-bridge
 * @description Channel Engine Bridge enables seamless pushing of FAST channels from FAST Channel Engine to distribution platforms such as AWS MediaPackage and simplifies the process of pushing channels to a wide range of distribution networks.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://docs.osaas.io/osaas.wiki/Service:-Channel-Engine-Bridge.html|Online docs} for further information
 */

/**
 * @typedef {Object} EyevinnChannelEngineBridgeConfig
 * @property {string} name - Name of channel-engine-bridge
 * @property {string} Source - URL to source HLS
 * @property {enum} DestType - Type of destination
 * @property {string} DestUrl - Destination URL
 * @property {string} [AwsAccessKeyId] - AwsAccessKeyId
 * @property {string} [AwsSecretAccessKey] - AwsSecretAccessKey
 * @property {string} [AwsRegion] - AwsRegion

 * 
 */

/**
 * @typedef {Object} EyevinnChannelEngineBridge
 * @property {string} name - Name of the Channel Engine Bridge instance
 * @property {string} url - URL of the Channel Engine Bridge instance
 *
 */

/**
 * Create a new Channel Engine Bridge instance
 *
 * @memberOf eyevinn-channel-engine-bridge
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnChannelEngineBridgeConfig} body - Service instance configuration
 * @returns {EyevinnChannelEngineBridge} - Service instance
 * @example
 * import { Context, createEyevinnChannelEngineBridgeInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnChannelEngineBridgeInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnChannelEngineBridgeInstance(
  ctx: Context,
  body: EyevinnChannelEngineBridgeConfig
): Promise<EyevinnChannelEngineBridge> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-channel-engine-bridge'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-channel-engine-bridge',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady(
    'eyevinn-channel-engine-bridge',
    instance.name,
    ctx
  );
  return instance;
}

/**
 * Remove a Channel Engine Bridge instance
 *
 * @memberOf eyevinn-channel-engine-bridge
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the channel-engine-bridge to be removed
 */
export async function removeEyevinnChannelEngineBridgeInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-channel-engine-bridge'
  );
  await removeInstance(
    ctx,
    'eyevinn-channel-engine-bridge',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Channel Engine Bridge instance
 *
 * @memberOf eyevinn-channel-engine-bridge
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the channel-engine-bridge to be retrieved
 * @returns {EyevinnChannelEngineBridge} - Service instance
 */
export async function getEyevinnChannelEngineBridgeInstance(
  ctx: Context,
  name: string
): Promise<EyevinnChannelEngineBridge> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-channel-engine-bridge'
  );
  return await getInstance(
    ctx,
    'eyevinn-channel-engine-bridge',
    name,
    serviceAccessToken
  );
}
