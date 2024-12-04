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
  '/osc-postgresqlinstance': {
    /** List all running osc-postgresql instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the osc-postgresql instance */
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
            PostgresPassword: string;
            PostgresUser?: string;
            PostgresDb?: string;
            PostgresInitDbArgs?: string;
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
    /** Launch a new osc-postgresql instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the osc-postgresql instance */
            name: string;
            PostgresPassword: string;
            PostgresUser?: string;
            PostgresDb?: string;
            PostgresInitDbArgs?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the osc-postgresql instance */
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
            PostgresPassword: string;
            PostgresUser?: string;
            PostgresDb?: string;
            PostgresInitDbArgs?: string;
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
  '/osc-postgresqlinstance/{id}': {
    /** Obtain status and resource URLs for an osc-postgresql instance */
    get: {
      parameters: {
        path: {
          /** Name of the osc-postgresql instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the osc-postgresql instance */
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
            PostgresPassword: string;
            PostgresUser?: string;
            PostgresDb?: string;
            PostgresInitDbArgs?: string;
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
    /** Stop and remove an osc-postgresql instance */
    delete: {
      parameters: {
        path: {
          /** Name of the osc-postgresql instance */
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
    /** Return status of osc-postgresql instance */
    get: {
      parameters: {
        path: {
          /** Name of the osc-postgresql instance */
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
    /** Return the latest logs from the osc-postgresql instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the osc-postgresql instance */
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
    /** Return the exposed extra ports for osc-postgresql instance */
    get: {
      parameters: {
        path: {
          /** Name of the osc-postgresql instance */
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

export type BirmeOscPostgresql =
  paths['/osc-postgresqlinstance/{id}']['get']['responses']['200']['schema'];

export type BirmeOscPostgresqlConfig =
  paths['/osc-postgresqlinstance']['post']['parameters']['body']['body'];

import { Context, createInstance } from '@osaas/client-core';

export async function createBirmeOscPostgresqlInstance(
  ctx: Context,
  body: BirmeOscPostgresqlConfig
): Promise<BirmeOscPostgresql> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'birme-osc-postgresql'
  );
  return await createInstance(
    ctx,
    'birme-osc-postgresql',
    serviceAccessToken,
    body
  );
}
