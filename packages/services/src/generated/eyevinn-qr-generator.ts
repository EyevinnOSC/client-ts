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
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-qr-generator
 * @description Effortlessly create and customize QR codes with dynamic text and logos. Perfect for projects requiring quick updates. Launch your instance and deploy multiple codes seamlessly on the Open Source Cloud.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} EyevinnQrGeneratorConfig
 * @property {string} name - Name of qr-generator
 * @property {string} GotoUrl - GotoUrl
 * @property {string | undefined} LogoUrl - LogoUrl

 * 
 */

/**
 * @typedef {Object} EyevinnQrGenerator
 * @property {string} name - Name of the QR Code Generator instance
 * @property {string} url - URL of the QR Code Generator instance
 *
 */

/**
 * Create a new QR Code Generator instance
 *
 * @memberOf eyevinn-qr-generator
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnQrGeneratorConfig} body - Service instance configuration
 * @returns {EyevinnQrGenerator} - Service instance
 * @example
 * import { Context, createEyevinnQrGeneratorInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createEyevinnQrGeneratorInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createEyevinnQrGeneratorInstance(
  ctx: Context,
  body: EyevinnQrGeneratorConfig
): Promise<EyevinnQrGenerator> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-qr-generator'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-qr-generator',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-qr-generator', instance.name, ctx);
  return instance;
}

/**
 * Remove a QR Code Generator instance
 *
 * @memberOf eyevinn-qr-generator
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the qr-generator to be removed
 */
export async function removeEyevinnQrGeneratorInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-qr-generator'
  );
  await removeInstance(ctx, 'eyevinn-qr-generator', name, serviceAccessToken);
}

/**
 * Get a QR Code Generator instance
 *
 * @memberOf eyevinn-qr-generator
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the qr-generator to be retrieved
 * @returns {EyevinnQrGenerator} - Service instance
 */
export async function getEyevinnQrGeneratorInstance(
  ctx: Context,
  name: string
): Promise<EyevinnQrGenerator> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-qr-generator'
  );
  return await getInstance(
    ctx,
    'eyevinn-qr-generator',
    name,
    serviceAccessToken
  );
}
