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
  '/smoothmqinstance': {
    /** List all running smoothmq instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the smoothmq instance */
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
            AccessKey?: string;
            SecretKey?: string;
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
    /** Launch a new smoothmq instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the smoothmq instance */
            name: string;
            AccessKey?: string;
            SecretKey?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the smoothmq instance */
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
            AccessKey?: string;
            SecretKey?: string;
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
  '/smoothmqinstance/{id}': {
    /** Obtain status and resource URLs for an smoothmq instance */
    get: {
      parameters: {
        path: {
          /** Name of the smoothmq instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the smoothmq instance */
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
            AccessKey?: string;
            SecretKey?: string;
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
    /** Stop and remove an smoothmq instance */
    delete: {
      parameters: {
        path: {
          /** Name of the smoothmq instance */
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
    /** Return status of smoothmq instance */
    get: {
      parameters: {
        path: {
          /** Name of the smoothmq instance */
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
    /** Return the latest logs from the smoothmq instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the smoothmq instance */
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
    /** Return the exposed extra ports for smoothmq instance */
    get: {
      parameters: {
        path: {
          /** Name of the smoothmq instance */
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

export type PoundifdefSmoothmq =
  paths['/smoothmqinstance/{id}']['get']['responses']['200']['schema'];

export type PoundifdefSmoothmqConfig =
  paths['/smoothmqinstance']['post']['parameters']['body']['body'];

import { Context, createInstance } from '@osaas/client-core';

/**
 * SmoothMQ
 *
 * Introducing SmoothMQ, the ultimate drop-in replacement for SQS! Enhance your developer experience with a functional UI, observability, tracing, scheduling, and rate-limiting. Run your own private SQS on any cloud effortlessly.
 *
 * Create a new message-queue
 * @param {Context} context - Open Source Cloud configuration context
 * @param {PoundifdefSmoothmqConfig}} body - Service instance configuration
 * @returns {PoundifdefSmoothmq} - Service instance
 * @example
 * import { Context, createPoundifdefSmoothmqInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createPoundifdefSmoothmqInstance(ctx, { name: 'my-instance' });
 * console.log(instance.url);
 */
export async function createPoundifdefSmoothmqInstance(
  ctx: Context,
  body: PoundifdefSmoothmqConfig
): Promise<PoundifdefSmoothmq> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'poundifdef-smoothmq'
  );
  return await createInstance(
    ctx,
    'poundifdef-smoothmq',
    serviceAccessToken,
    body
  );
}
