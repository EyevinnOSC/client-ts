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
  '/couchdbinstance': {
    /** List all running couchdb instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the couchdb instance */
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
            AdminPassword: string;
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
    /** Launch a new couchdb instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the couchdb instance */
            name: string;
            AdminPassword: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the couchdb instance */
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
            AdminPassword: string;
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
  '/couchdbinstance/{id}': {
    /** Obtain status and resource URLs for an couchdb instance */
    get: {
      parameters: {
        path: {
          /** Name of the couchdb instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the couchdb instance */
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
            AdminPassword: string;
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
    /** Stop and remove an couchdb instance */
    delete: {
      parameters: {
        path: {
          /** Name of the couchdb instance */
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
    /** Return status of couchdb instance */
    get: {
      parameters: {
        path: {
          /** Name of the couchdb instance */
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
    /** Return the latest logs from the couchdb instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the couchdb instance */
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
    /** Return the exposed extra ports for couchdb instance */
    get: {
      parameters: {
        path: {
          /** Name of the couchdb instance */
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

export type ApacheCouchdb =
  paths['/couchdbinstance/{id}']['get']['responses']['200']['schema'];

export type ApacheCouchdbConfig =
  paths['/couchdbinstance']['post']['parameters']['body']['body'];

import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new Couch DB instance
 *
 * @description Unlock seamless data management with Apache CouchDB! Effortlessly scalable and highly available, CouchDB makes storing, retrieving, and syncing data across devices a breeze. Ideal for modern cloud apps!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {ApacheCouchdbConfig}} body - Service instance configuration
 * @returns {ApacheCouchdb} - Service instance
 * @example
 * import { Context, createApacheCouchdbInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createApacheCouchdbInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createApacheCouchdbInstance(
  ctx: Context,
  body: ApacheCouchdbConfig
): Promise<ApacheCouchdb> {
  const serviceAccessToken = await ctx.getServiceAccessToken('apache-couchdb');
  const instance = await createInstance(
    ctx,
    'apache-couchdb',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('apache-couchdb', instance.name, ctx);
  return instance;
}

/**
 * Remove a Couch DB instance
 *
 * @description Unlock seamless data management with Apache CouchDB! Effortlessly scalable and highly available, CouchDB makes storing, retrieving, and syncing data across devices a breeze. Ideal for modern cloud apps!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the couchdb to be removed
 */
export async function removeApacheCouchdbInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken('apache-couchdb');
  await removeInstance(ctx, 'apache-couchdb', name, serviceAccessToken);
}

/**
 * Get a Couch DB instance
 *
 * @description Unlock seamless data management with Apache CouchDB! Effortlessly scalable and highly available, CouchDB makes storing, retrieving, and syncing data across devices a breeze. Ideal for modern cloud apps!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the couchdb to be retrieved
 * @returns {ApacheCouchdb} - Service instance
 */
export async function getApacheCouchdbInstance(
  ctx: Context,
  name: string
): Promise<ApacheCouchdb> {
  const serviceAccessToken = await ctx.getServiceAccessToken('apache-couchdb');
  return await getInstance(ctx, 'apache-couchdb', name, serviceAccessToken);
}
