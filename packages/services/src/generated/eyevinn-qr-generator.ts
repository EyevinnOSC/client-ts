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
  '/qr-generatorinstance': {
    /** List all running qr-generator instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the qr-generator instance */
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
            GotoUrl: string;
            LogoUrl?: string;
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
    /** Launch a new qr-generator instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the qr-generator instance */
            name: string;
            GotoUrl: string;
            LogoUrl?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the qr-generator instance */
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
            GotoUrl: string;
            LogoUrl?: string;
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
  '/qr-generatorinstance/{id}': {
    /** Obtain status and resource URLs for an qr-generator instance */
    get: {
      parameters: {
        path: {
          /** Name of the qr-generator instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the qr-generator instance */
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
            GotoUrl: string;
            LogoUrl?: string;
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
    /** Stop and remove an qr-generator instance */
    delete: {
      parameters: {
        path: {
          /** Name of the qr-generator instance */
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
    /** Return status of qr-generator instance */
    get: {
      parameters: {
        path: {
          /** Name of the qr-generator instance */
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
    /** Return the latest logs from the qr-generator instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the qr-generator instance */
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
    /** Return the exposed extra ports for qr-generator instance */
    get: {
      parameters: {
        path: {
          /** Name of the qr-generator instance */
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

export type EyevinnQrGenerator =
  paths['/qr-generatorinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnQrGeneratorConfig =
  paths['/qr-generatorinstance']['post']['parameters']['body']['body'];

import { Context, createInstance } from '@osaas/client-core';

/**
 * QR Code Generator
 *
 * Effortlessly create and customize QR codes with dynamic text and logos. Perfect for projects requiring quick updates. Launch your instance and deploy multiple codes seamlessly on the Open Source Cloud.
 *
 * Create a new qr-generator
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnQrGeneratorConfig}} body - Service instance configuration
 * @returns {EyevinnQrGenerator} - Service instance
 * @example
 * import { Context, createEyevinnQrGeneratorInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnQrGeneratorInstance(ctx, { name: 'my-instance' });
 * console.log(instance.url);
 */
export async function createEyevinnQrGeneratorInstance(
  ctx: Context,
  body: EyevinnQrGeneratorConfig
): Promise<EyevinnQrGenerator> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-qr-generator'
  );
  return await createInstance(
    ctx,
    'eyevinn-qr-generator',
    serviceAccessToken,
    body
  );
}