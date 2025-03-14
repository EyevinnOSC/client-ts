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
  '/docusealinstance': {
    /** List all running docuseal instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the docuseal instance */
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
    /** Launch a new docuseal instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the docuseal instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the docuseal instance */
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
  '/docusealinstance/{id}': {
    /** Obtain status and resource URLs for an docuseal instance */
    get: {
      parameters: {
        path: {
          /** Name of the docuseal instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the docuseal instance */
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
    /** Stop and remove an docuseal instance */
    delete: {
      parameters: {
        path: {
          /** Name of the docuseal instance */
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
    /** Return status of docuseal instance */
    get: {
      parameters: {
        path: {
          /** Name of the docuseal instance */
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
    /** Return the latest logs from the docuseal instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the docuseal instance */
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
    /** Return the exposed extra ports for docuseal instance */
    get: {
      parameters: {
        path: {
          /** Name of the docuseal instance */
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

export type DocusealcoDocuseal =
  paths['/docusealinstance/{id}']['get']['responses']['200']['schema'];

export type DocusealcoDocusealConfig =
  paths['/docusealinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace docusealco-docuseal
 * @description Streamline your document workflow with DocuSeal, the leading open-source solution for secure, mobile-optimized digital form filling and signing. Perfect for any business needing swift and seamless e-signatures.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} DocusealcoDocusealConfig
 * @property {string} name - Name of docuseal

 * 
 */

/**
 * @typedef {Object} DocusealcoDocuseal
 * @property {string} name - Name of the Docuseal instance
 * @property {string} url - URL of the Docuseal instance
 *
 */

/**
 * Create a new Docuseal instance
 *
 * @memberOf docusealco-docuseal
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {DocusealcoDocusealConfig} body - Service instance configuration
 * @returns {DocusealcoDocuseal} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createDocusealcoDocusealInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: DocusealcoDocusealConfig = { name: 'myinstance', ... };
 * const instance = await createDocusealcoDocusealInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createDocusealcoDocusealInstance(
  ctx: Context,
  body: DocusealcoDocusealConfig
): Promise<DocusealcoDocuseal> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'docusealco-docuseal'
  );
  const instance = await createInstance(
    ctx,
    'docusealco-docuseal',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('docusealco-docuseal', instance.name, ctx);
  return instance;
}

/**
 * Remove a Docuseal instance
 *
 * @memberOf docusealco-docuseal
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the docuseal to be removed
 */
export async function removeDocusealcoDocusealInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'docusealco-docuseal'
  );
  await removeInstance(ctx, 'docusealco-docuseal', name, serviceAccessToken);
}

/**
 * Get a Docuseal instance
 *
 * @memberOf docusealco-docuseal
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the docuseal to be retrieved
 * @returns {DocusealcoDocuseal} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getDocusealcoDocusealInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getDocusealcoDocusealInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getDocusealcoDocusealInstance(
  ctx: Context,
  name: string
): Promise<DocusealcoDocuseal> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'docusealco-docuseal'
  );
  return await getInstance(
    ctx,
    'docusealco-docuseal',
    name,
    serviceAccessToken
  );
}
