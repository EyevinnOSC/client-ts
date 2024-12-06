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

import { Context, createInstance } from '@osaas/client-core';

/**
 * Trim Media
 *
 * A serverless media function to trim single media file or an ABR bundle of media files and upload the output to an S3 bucket.
 *
 * Create a new mediafunction
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnFunctionTrimConfig}} body - Service instance configuration
 * @returns {EyevinnFunctionTrim} - Service instance
 * @example
 * import { Context, createEyevinnFunctionTrimInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnFunctionTrimInstance(ctx, { name: 'my-instance' });
 * console.log(instance.url);
 */
export async function createEyevinnFunctionTrimInstance(
  ctx: Context,
  body: EyevinnFunctionTrimConfig
): Promise<EyevinnFunctionTrim> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-function-trim'
  );
  return await createInstance(
    ctx,
    'eyevinn-function-trim',
    serviceAccessToken,
    body
  );
}
