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
  '/cast-receiverinstance': {
    /** List all running cast-receiver instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the cast-receiver instance */
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
            title: string;
            castReceiverOptions?: string;
            playbackLogoUrl?: string;
            logoUrl?: string;
            castMediaPlayerStyle?: string;
          }[];
        };
        /** Default Response */
        500: {
          schema: string;
        };
      };
    };
    /** Launch a new cast-receiver instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the cast-receiver instance */
            name: string;
            title: string;
            castReceiverOptions?: string;
            playbackLogoUrl?: string;
            logoUrl?: string;
            castMediaPlayerStyle?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the cast-receiver instance */
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
            title: string;
            castReceiverOptions?: string;
            playbackLogoUrl?: string;
            logoUrl?: string;
            castMediaPlayerStyle?: string;
          };
        };
        /** Default Response */
        500: {
          schema: string;
        };
      };
    };
  };
  '/cast-receiverinstance/{id}': {
    /** Obtain status and resource URLs for an cast-receiver instance */
    get: {
      parameters: {
        path: {
          /** Name of the cast-receiver instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the cast-receiver instance */
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
            title: string;
            castReceiverOptions?: string;
            playbackLogoUrl?: string;
            logoUrl?: string;
            castMediaPlayerStyle?: string;
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
    /** Stop and remove an cast-receiver instance */
    delete: {
      parameters: {
        path: {
          /** Name of the cast-receiver instance */
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
    /** Return status of cast-receiver instance */
    get: {
      parameters: {
        path: {
          /** Name of the cast-receiver instance */
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

export type EyevinnCastReceiver =
  paths['/cast-receiverinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnCastReceiverConfig =
  paths['/cast-receiverinstance']['post']['parameters']['body']['body'];

import { Context, createInstance } from '@osaas/client-core';

export async function createEyevinnCastReceiverInstance(
  ctx: Context,
  body: EyevinnCastReceiverConfig
): Promise<EyevinnCastReceiver> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-cast-receiver'
  );
  return await createInstance(
    ctx,
    'eyevinn-cast-receiver',
    serviceAccessToken,
    body
  );
}
