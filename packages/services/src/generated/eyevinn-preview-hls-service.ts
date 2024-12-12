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
  '/preview-hls-serviceinstance': {
    /** List all running preview-hls-service instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the preview-hls-service instance */
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
          schema: string;
        };
      };
    };
    /** Launch a new preview-hls-service instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the preview-hls-service instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the preview-hls-service instance */
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
        500: {
          schema: string;
        };
      };
    };
  };
  '/preview-hls-serviceinstance/{id}': {
    /** Obtain status and resource URLs for an preview-hls-service instance */
    get: {
      parameters: {
        path: {
          /** Name of the preview-hls-service instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the preview-hls-service instance */
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
          schema: string;
        };
        /** Default Response */
        500: {
          schema: string;
        };
      };
    };
    /** Stop and remove an preview-hls-service instance */
    delete: {
      parameters: {
        path: {
          /** Name of the preview-hls-service instance */
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
          schema: string;
        };
      };
    };
  };
}

export interface definitions {}

export interface operations {}

export interface external {}

export type EyevinnPreviewHlsService =
  paths['/preview-hls-serviceinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnPreviewHlsServiceConfig =
  paths['/preview-hls-serviceinstance']['post']['parameters']['body']['body'];

import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new HLS Preview Generator instance
 *
 * @description A service to generate a preview video (mp4) or an image (png) from an HLS stream
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnPreviewHlsServiceConfig}} body - Service instance configuration
 * @returns {EyevinnPreviewHlsService} - Service instance
 * @example
 * import { Context, createEyevinnPreviewHlsServiceInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnPreviewHlsServiceInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnPreviewHlsServiceInstance(
  ctx: Context,
  body: EyevinnPreviewHlsServiceConfig
): Promise<EyevinnPreviewHlsService> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-preview-hls-service'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-preview-hls-service',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-preview-hls-service', instance.name, ctx);
  return instance;
}

/**
 * Remove a HLS Preview Generator instance
 *
 * @description A service to generate a preview video (mp4) or an image (png) from an HLS stream
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the preview-generator to be removed
 */
export async function removeEyevinnPreviewHlsServiceInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-preview-hls-service'
  );
  await removeInstance(
    ctx,
    'eyevinn-preview-hls-service',
    name,
    serviceAccessToken
  );
}

/**
 * Get a HLS Preview Generator instance
 *
 * @description A service to generate a preview video (mp4) or an image (png) from an HLS stream
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the preview-generator to be retrieved
 * @returns {EyevinnPreviewHlsService} - Service instance
 */
export async function getEyevinnPreviewHlsServiceInstance(
  ctx: Context,
  name: string
): Promise<EyevinnPreviewHlsService> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-preview-hls-service'
  );
  return await getInstance(
    ctx,
    'eyevinn-preview-hls-service',
    name,
    serviceAccessToken
  );
}
