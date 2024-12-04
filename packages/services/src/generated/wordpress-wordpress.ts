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
  '/wordpressinstance': {
    /** List all running wordpress instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the wordpress instance */
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
            DbHost: string;
            DbUser: string;
            DbPassword: string;
            DbName?: string;
            DbTablePrefix?: string;
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
    /** Launch a new wordpress instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the wordpress instance */
            name: string;
            DbHost: string;
            DbUser: string;
            DbPassword: string;
            DbName?: string;
            DbTablePrefix?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the wordpress instance */
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
            DbHost: string;
            DbUser: string;
            DbPassword: string;
            DbName?: string;
            DbTablePrefix?: string;
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
  '/wordpressinstance/{id}': {
    /** Obtain status and resource URLs for an wordpress instance */
    get: {
      parameters: {
        path: {
          /** Name of the wordpress instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the wordpress instance */
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
            DbHost: string;
            DbUser: string;
            DbPassword: string;
            DbName?: string;
            DbTablePrefix?: string;
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
    /** Stop and remove an wordpress instance */
    delete: {
      parameters: {
        path: {
          /** Name of the wordpress instance */
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
    /** Return status of wordpress instance */
    get: {
      parameters: {
        path: {
          /** Name of the wordpress instance */
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
    /** Return the latest logs from the wordpress instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the wordpress instance */
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
    /** Return the exposed extra ports for wordpress instance */
    get: {
      parameters: {
        path: {
          /** Name of the wordpress instance */
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

export type WordpressWordpress =
  paths['/wordpressinstance/{id}']['get']['responses']['200']['schema'];

export type WordpressWordpressConfig =
  paths['/wordpressinstance']['post']['parameters']['body']['body'];

import { Context, createInstance } from '@osaas/client-core';

export async function createWordpressWordpressInstance(
  ctx: Context,
  body: WordpressWordpressConfig
): Promise<WordpressWordpress> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'wordpress-wordpress'
  );
  return await createInstance(
    ctx,
    'wordpress-wordpress',
    serviceAccessToken,
    body
  );
}
