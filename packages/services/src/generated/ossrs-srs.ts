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
  '/srsinstance': {
    /** List all running srs instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the srs instance */
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
          schema: string;
        };
      };
    };
    /** Launch a new srs instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the srs instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the srs instance */
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
        500: {
          schema: string;
        };
      };
    };
  };
  '/srsinstance/{id}': {
    /** Obtain status and resource URLs for an srs instance */
    get: {
      parameters: {
        path: {
          /** Name of the srs instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the srs instance */
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
          schema: string;
        };
        /** Default Response */
        500: {
          schema: string;
        };
      };
    };
    /** Stop and remove an srs instance */
    delete: {
      parameters: {
        path: {
          /** Name of the srs instance */
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
    /** Return status of srs instance */
    get: {
      parameters: {
        path: {
          /** Name of the srs instance */
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
  '/logs/{id}': {
    /** Return the latest logs from the srs instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the srs instance */
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
          schema: string;
        };
      };
    };
  };
  '/ports/{id}': {
    /** Return the exposed extra ports for srs instance */
    get: {
      parameters: {
        path: {
          /** Name of the srs instance */
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
          schema: string;
        };
      };
    };
  };
}

export interface definitions {}

export interface operations {}

export interface external {}

export type OssrsSrs =
  paths['/srsinstance/{id}']['get']['responses']['200']['schema'];

export type OssrsSrsConfig =
  paths['/srsinstance']['post']['parameters']['body']['body'];

import { Context, createInstance } from '@osaas/client-core';

export async function createOssrsSrsInstance(
  ctx: Context,
  body: OssrsSrsConfig
): Promise<OssrsSrs> {
  const serviceAccessToken = await ctx.getServiceAccessToken('ossrs-srs');
  return await createInstance(ctx, 'ossrs-srs', serviceAccessToken, body);
}
