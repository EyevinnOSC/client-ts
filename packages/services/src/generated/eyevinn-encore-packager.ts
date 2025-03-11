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
  '/encore-packagerinstance': {
    /** List all running encore-packager instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the encore-packager instance */
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
            RedisUrl: string;
            RedisQueue?: string;
            OutputFolder: string;
            Concurrency?: string;
            PersonalAccessToken: string;
            AwsAccessKeyId: string;
            AwsSecretAccessKey: string;
            AwsRegion?: string;
            AwsSessionToken?: string;
            S3EndpointUrl?: string;
            OutputSubfolderTemplate?: string;
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
    /** Launch a new encore-packager instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the encore-packager instance */
            name: string;
            RedisUrl: string;
            RedisQueue?: string;
            OutputFolder: string;
            Concurrency?: string;
            PersonalAccessToken: string;
            AwsAccessKeyId: string;
            AwsSecretAccessKey: string;
            AwsRegion?: string;
            AwsSessionToken?: string;
            S3EndpointUrl?: string;
            OutputSubfolderTemplate?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the encore-packager instance */
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
            RedisUrl: string;
            RedisQueue?: string;
            OutputFolder: string;
            Concurrency?: string;
            PersonalAccessToken: string;
            AwsAccessKeyId: string;
            AwsSecretAccessKey: string;
            AwsRegion?: string;
            AwsSessionToken?: string;
            S3EndpointUrl?: string;
            OutputSubfolderTemplate?: string;
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
  '/encore-packagerinstance/{id}': {
    /** Obtain status and resource URLs for an encore-packager instance */
    get: {
      parameters: {
        path: {
          /** Name of the encore-packager instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the encore-packager instance */
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
            RedisUrl: string;
            RedisQueue?: string;
            OutputFolder: string;
            Concurrency?: string;
            PersonalAccessToken: string;
            AwsAccessKeyId: string;
            AwsSecretAccessKey: string;
            AwsRegion?: string;
            AwsSessionToken?: string;
            S3EndpointUrl?: string;
            OutputSubfolderTemplate?: string;
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
    /** Stop and remove an encore-packager instance */
    delete: {
      parameters: {
        path: {
          /** Name of the encore-packager instance */
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
    /** Return status of encore-packager instance */
    get: {
      parameters: {
        path: {
          /** Name of the encore-packager instance */
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
    /** Return the latest logs from the encore-packager instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the encore-packager instance */
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
    /** Return the exposed extra ports for encore-packager instance */
    get: {
      parameters: {
        path: {
          /** Name of the encore-packager instance */
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

export type EyevinnEncorePackager =
  paths['/encore-packagerinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnEncorePackagerConfig =
  paths['/encore-packagerinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-encore-packager
 * @description Enhance your transcoding workflow with Encore packager! Run as a service, listen for messages on redis queue, and customize packaging events. Boost productivity with this versatile tool.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} EyevinnEncorePackagerConfig
 * @property {string} name - Name of encore-packager
 * @property {string} RedisUrl - RedisUrl
 * @property {string} [RedisQueue] - RedisQueue
 * @property {string} OutputFolder - OutputFolder
 * @property {string} [Concurrency] - Concurrency
 * @property {string} PersonalAccessToken - PersonalAccessToken
 * @property {string} AwsAccessKeyId - AwsAccessKeyId
 * @property {string} AwsSecretAccessKey - AwsSecretAccessKey
 * @property {string} [AwsRegion] - AwsRegion
 * @property {string} [AwsSessionToken] - AwsSessionToken
 * @property {string} [S3EndpointUrl] - S3EndpointUrl
 * @property {string} [OutputSubfolderTemplate] - OutputSubfolderTemplate

 * 
 */

/**
 * @typedef {Object} EyevinnEncorePackager
 * @property {string} name - Name of the Encore Packager instance
 * @property {string} url - URL of the Encore Packager instance
 *
 */

/**
 * Create a new Encore Packager instance
 *
 * @memberOf eyevinn-encore-packager
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnEncorePackagerConfig} body - Service instance configuration
 * @returns {EyevinnEncorePackager} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createEyevinnEncorePackagerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: EyevinnEncorePackagerConfig = { name: 'myinstance', ... };
 * const instance = await createEyevinnEncorePackagerInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createEyevinnEncorePackagerInstance(
  ctx: Context,
  body: EyevinnEncorePackagerConfig
): Promise<EyevinnEncorePackager> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-encore-packager'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-encore-packager',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-encore-packager', instance.name, ctx);
  return instance;
}

/**
 * Remove a Encore Packager instance
 *
 * @memberOf eyevinn-encore-packager
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the packager to be removed
 */
export async function removeEyevinnEncorePackagerInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-encore-packager'
  );
  await removeInstance(
    ctx,
    'eyevinn-encore-packager',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Encore Packager instance
 *
 * @memberOf eyevinn-encore-packager
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the packager to be retrieved
 * @returns {EyevinnEncorePackager} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getEyevinnEncorePackagerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getEyevinnEncorePackagerInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getEyevinnEncorePackagerInstance(
  ctx: Context,
  name: string
): Promise<EyevinnEncorePackager> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-encore-packager'
  );
  return await getInstance(
    ctx,
    'eyevinn-encore-packager',
    name,
    serviceAccessToken
  );
}
