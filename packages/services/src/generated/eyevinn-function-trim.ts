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
  '/function-triminstance': {
    /** List all running function-trim instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the function-trim instance */
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
            awsRegion: string;
            awsAccessKeyId: string;
            awsSecretAccessKey: string;
          }[];
        };
        /** Default Response */
        500: {
          schema: string;
        };
      };
    };
    /** Launch a new function-trim instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the function-trim instance */
            name: string;
            awsRegion: string;
            awsAccessKeyId: string;
            awsSecretAccessKey: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the function-trim instance */
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
            awsRegion: string;
            awsAccessKeyId: string;
            awsSecretAccessKey: string;
          };
        };
        /** Default Response */
        500: {
          schema: string;
        };
      };
    };
  };
  '/function-triminstance/{id}': {
    /** Obtain status and resource URLs for an function-trim instance */
    get: {
      parameters: {
        path: {
          /** Name of the function-trim instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the function-trim instance */
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
            awsRegion: string;
            awsAccessKeyId: string;
            awsSecretAccessKey: string;
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
    /** Stop and remove an function-trim instance */
    delete: {
      parameters: {
        path: {
          /** Name of the function-trim instance */
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
  '/health/{id}': {
    /** Return status of function-trim instance */
    get: {
      parameters: {
        path: {
          /** Name of the function-trim instance */
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
          schema: string;
        };
      };
    };
  };
}

export interface definitions {}

export interface operations {}

export interface external {}

export type EyevinnFunctionTrim =
  paths['/function-triminstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnFunctionTrimConfig =
  paths['/function-triminstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-function-trim
 * @description A serverless media function to trim single media file or an ABR bundle of media files and upload the output to an S3 bucket.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} EyevinnFunctionTrimConfig
 * @property {string} name - Name of mediafunction
 * @property {string} awsRegion - AWS Region where output S3 bucket resides
 * @property {string} awsAccessKeyId - AWS Access Key Id for S3 bucket access
 * @property {string} awsSecretAccessKey - AWS Secret Access Key for S3 bucket access

 * 
 */

/**
 * @typedef {Object} EyevinnFunctionTrim
 * @property {string} name - Name of the Trim Media instance
 * @property {string} url - URL of the Trim Media instance
 *
 */

/**
 * Create a new Trim Media instance
 *
 * @memberOf eyevinn-function-trim
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnFunctionTrimConfig} body - Service instance configuration
 * @returns {EyevinnFunctionTrim} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createEyevinnFunctionTrimInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: EyevinnFunctionTrimConfig = { name: 'myinstance', ... };
 * const instance = await createEyevinnFunctionTrimInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createEyevinnFunctionTrimInstance(
  ctx: Context,
  body: EyevinnFunctionTrimConfig
): Promise<EyevinnFunctionTrim> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-function-trim'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-function-trim',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-function-trim', instance.name, ctx);
  return instance;
}

/**
 * Remove a Trim Media instance
 *
 * @memberOf eyevinn-function-trim
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the mediafunction to be removed
 */
export async function removeEyevinnFunctionTrimInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-function-trim'
  );
  await removeInstance(ctx, 'eyevinn-function-trim', name, serviceAccessToken);
}

/**
 * Get a Trim Media instance
 *
 * @memberOf eyevinn-function-trim
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the mediafunction to be retrieved
 * @returns {EyevinnFunctionTrim} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getEyevinnFunctionTrimInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getEyevinnFunctionTrimInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getEyevinnFunctionTrimInstance(
  ctx: Context,
  name: string
): Promise<EyevinnFunctionTrim> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-function-trim'
  );
  return await getInstance(
    ctx,
    'eyevinn-function-trim',
    name,
    serviceAccessToken
  );
}
