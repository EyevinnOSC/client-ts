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
  '/captcha-svcinstance': {
    /** List all running captcha-svc instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the captcha-svc instance */
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
    /** Launch a new captcha-svc instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the captcha-svc instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the captcha-svc instance */
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
  '/captcha-svcinstance/{id}': {
    /** Obtain status and resource URLs for an captcha-svc instance */
    get: {
      parameters: {
        path: {
          /** Name of the captcha-svc instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the captcha-svc instance */
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
    /** Stop and remove an captcha-svc instance */
    delete: {
      parameters: {
        path: {
          /** Name of the captcha-svc instance */
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
    /** Return status of captcha-svc instance */
    get: {
      parameters: {
        path: {
          /** Name of the captcha-svc instance */
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
    /** Return the latest logs from the captcha-svc instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the captcha-svc instance */
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
    /** Return the exposed extra ports for captcha-svc instance */
    get: {
      parameters: {
        path: {
          /** Name of the captcha-svc instance */
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

export type BirmeCaptchaSvc =
  paths['/captcha-svcinstance/{id}']['get']['responses']['200']['schema'];

export type BirmeCaptchaSvcConfig =
  paths['/captcha-svcinstance']['post']['parameters']['body']['body'];

import { Context, createInstance } from '@osaas/client-core';

/**
 * Captcha Service
 *
 * Enhance your security effortlessly with our reliable CAPTCHA Service! Easily generate and verify CAPTCHAs to protect against automated attacks. Quick setup, seamless integration, robust solution!
 *
 * Create a new service
 * @param {Context} context - Open Source Cloud configuration context
 * @param {BirmeCaptchaSvcConfig}} body - Service instance configuration
 * @returns {BirmeCaptchaSvc} - Service instance
 * @example
 * import { Context, createBirmeCaptchaSvcInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createBirmeCaptchaSvcInstance(ctx, { name: 'my-instance' });
 * console.log(instance.url);
 */
export async function createBirmeCaptchaSvcInstance(
  ctx: Context,
  body: BirmeCaptchaSvcConfig
): Promise<BirmeCaptchaSvc> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'birme-captcha-svc'
  );
  return await createInstance(
    ctx,
    'birme-captcha-svc',
    serviceAccessToken,
    body
  );
}
