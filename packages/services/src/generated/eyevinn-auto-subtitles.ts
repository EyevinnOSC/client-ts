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
  '/auto-subtitlesinstance': {
    /** List all running auto-subtitles instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the auto-subtitles instance */
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
            openaikey: string;
            awsAccessKeyId?: string;
            awsSecretAccessKey?: string;
            awsRegion?: string;
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
    /** Launch a new auto-subtitles instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the auto-subtitles instance */
            name: string;
            openaikey: string;
            awsAccessKeyId?: string;
            awsSecretAccessKey?: string;
            awsRegion?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the auto-subtitles instance */
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
            openaikey: string;
            awsAccessKeyId?: string;
            awsSecretAccessKey?: string;
            awsRegion?: string;
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
  '/auto-subtitlesinstance/{id}': {
    /** Obtain status and resource URLs for an auto-subtitles instance */
    get: {
      parameters: {
        path: {
          /** Name of the auto-subtitles instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the auto-subtitles instance */
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
            openaikey: string;
            awsAccessKeyId?: string;
            awsSecretAccessKey?: string;
            awsRegion?: string;
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
    /** Stop and remove an auto-subtitles instance */
    delete: {
      parameters: {
        path: {
          /** Name of the auto-subtitles instance */
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
    /** Return status of auto-subtitles instance */
    get: {
      parameters: {
        path: {
          /** Name of the auto-subtitles instance */
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
    /** Return the latest logs from the auto-subtitles instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the auto-subtitles instance */
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
    /** Return the exposed extra ports for auto-subtitles instance */
    get: {
      parameters: {
        path: {
          /** Name of the auto-subtitles instance */
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

export type EyevinnAutoSubtitles =
  paths['/auto-subtitlesinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnAutoSubtitlesConfig =
  paths['/auto-subtitlesinstance']['post']['parameters']['body']['body'];

import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new Subtitle Generator instance
 *
 * @description Automatically generate subtitles from an input audio or video file using Open AI Whisper.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnAutoSubtitlesConfig}} body - Service instance configuration
 * @returns {EyevinnAutoSubtitles} - Service instance
 * @example
 * import { Context, createEyevinnAutoSubtitlesInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnAutoSubtitlesInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnAutoSubtitlesInstance(
  ctx: Context,
  body: EyevinnAutoSubtitlesConfig
): Promise<EyevinnAutoSubtitles> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-auto-subtitles'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-auto-subtitles',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-auto-subtitles', instance.name, ctx);
  return instance;
}

/**
 * Remove a Subtitle Generator instance
 *
 * @description Automatically generate subtitles from an input audio or video file using Open AI Whisper.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the generator to be removed
 */
export async function removeEyevinnAutoSubtitlesInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-auto-subtitles'
  );
  await removeInstance(ctx, 'eyevinn-auto-subtitles', name, serviceAccessToken);
}

/**
 * Get a Subtitle Generator instance
 *
 * @description Automatically generate subtitles from an input audio or video file using Open AI Whisper.
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the generator to be retrieved
 * @returns {EyevinnAutoSubtitles} - Service instance
 */
export async function getEyevinnAutoSubtitlesInstance(
  ctx: Context,
  name: string
): Promise<EyevinnAutoSubtitles> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-auto-subtitles'
  );
  return await getInstance(
    ctx,
    'eyevinn-auto-subtitles',
    name,
    serviceAccessToken
  );
}
