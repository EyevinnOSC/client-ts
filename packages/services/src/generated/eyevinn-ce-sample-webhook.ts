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
  '/ce-sample-webhookinstance': {
    /** List all running ce-sample-webhook instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the ce-sample-webhook instance */
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
    /** Launch a new ce-sample-webhook instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the ce-sample-webhook instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the ce-sample-webhook instance */
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
  '/ce-sample-webhookinstance/{id}': {
    /** Obtain status and resource URLs for an ce-sample-webhook instance */
    get: {
      parameters: {
        path: {
          /** Name of the ce-sample-webhook instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the ce-sample-webhook instance */
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
    /** Stop and remove an ce-sample-webhook instance */
    delete: {
      parameters: {
        path: {
          /** Name of the ce-sample-webhook instance */
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
    /** Return status of ce-sample-webhook instance */
    get: {
      parameters: {
        path: {
          /** Name of the ce-sample-webhook instance */
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
    /** Return the latest logs from the ce-sample-webhook instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the ce-sample-webhook instance */
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
    /** Return the exposed extra ports for ce-sample-webhook instance */
    get: {
      parameters: {
        path: {
          /** Name of the ce-sample-webhook instance */
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

export type EyevinnCeSampleWebhook =
  paths['/ce-sample-webhookinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnCeSampleWebhookConfig =
  paths['/ce-sample-webhookinstance']['post']['parameters']['body']['body'];

import { Context, createInstance } from '@osaas/client-core';

export async function createEyevinnCeSampleWebhookInstance(
  ctx: Context,
  body: EyevinnCeSampleWebhookConfig
): Promise<EyevinnCeSampleWebhook> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-ce-sample-webhook'
  );
  return await createInstance(
    ctx,
    'eyevinn-ce-sample-webhook',
    serviceAccessToken,
    body
  );
}
