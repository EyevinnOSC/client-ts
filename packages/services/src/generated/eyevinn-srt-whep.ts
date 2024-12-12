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
  '/srt-whepinstance': {
    /** List all running srt-whep instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the srt-whep instance */
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
            SourceIp: string;
            SourcePort: string;
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
    /** Launch a new srt-whep instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the srt-whep instance */
            name: string;
            SourceIp: string;
            SourcePort: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the srt-whep instance */
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
            SourceIp: string;
            SourcePort: string;
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
  '/srt-whepinstance/{id}': {
    /** Obtain status and resource URLs for an srt-whep instance */
    get: {
      parameters: {
        path: {
          /** Name of the srt-whep instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the srt-whep instance */
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
            SourceIp: string;
            SourcePort: string;
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
    /** Stop and remove an srt-whep instance */
    delete: {
      parameters: {
        path: {
          /** Name of the srt-whep instance */
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
    /** Return status of srt-whep instance */
    get: {
      parameters: {
        path: {
          /** Name of the srt-whep instance */
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
    /** Return the latest logs from the srt-whep instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the srt-whep instance */
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
    /** Return the exposed extra ports for srt-whep instance */
    get: {
      parameters: {
        path: {
          /** Name of the srt-whep instance */
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

export type EyevinnSrtWhep =
  paths['/srt-whepinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnSrtWhepConfig =
  paths['/srt-whepinstance']['post']['parameters']['body']['body'];

import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new SRT WHEP Bridge instance
 *
 * @description SRT to WHEP application ingests MPEG-TS over SRT stream and outputs to WebRTC using WHEP signaling protocol, supporting MacOS and Ubuntu. No video transcoding, SDP offer/answer exchange focus, and compliance with popular production software. Get yours now!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnSrtWhepConfig}} body - Service instance configuration
 * @returns {EyevinnSrtWhep} - Service instance
 * @example
 * import { Context, createEyevinnSrtWhepInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnSrtWhepInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnSrtWhepInstance(
  ctx: Context,
  body: EyevinnSrtWhepConfig
): Promise<EyevinnSrtWhep> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-srt-whep'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-srt-whep',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-srt-whep', instance.name, ctx);
  return instance;
}

/**
 * Remove a SRT WHEP Bridge instance
 *
 * @description SRT to WHEP application ingests MPEG-TS over SRT stream and outputs to WebRTC using WHEP signaling protocol, supporting MacOS and Ubuntu. No video transcoding, SDP offer/answer exchange focus, and compliance with popular production software. Get yours now!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the bridge to be removed
 */
export async function removeEyevinnSrtWhepInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-srt-whep'
  );
  await removeInstance(ctx, 'eyevinn-srt-whep', name, serviceAccessToken);
}

/**
 * Get a SRT WHEP Bridge instance
 *
 * @description SRT to WHEP application ingests MPEG-TS over SRT stream and outputs to WebRTC using WHEP signaling protocol, supporting MacOS and Ubuntu. No video transcoding, SDP offer/answer exchange focus, and compliance with popular production software. Get yours now!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the bridge to be retrieved
 * @returns {EyevinnSrtWhep} - Service instance
 */
export async function getEyevinnSrtWhepInstance(
  ctx: Context,
  name: string
): Promise<EyevinnSrtWhep> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-srt-whep'
  );
  return await getInstance(ctx, 'eyevinn-srt-whep', name, serviceAccessToken);
}
