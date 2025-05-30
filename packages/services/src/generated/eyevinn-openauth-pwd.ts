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
  '/openauth-pwdinstance': {
    /** List all running openauth-pwd instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the openauth-pwd instance */
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
            UserDbUrl: string;
            SmtpMailerUrl: string;
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
    /** Launch a new openauth-pwd instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the openauth-pwd instance */
            name: string;
            UserDbUrl: string;
            SmtpMailerUrl: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the openauth-pwd instance */
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
            UserDbUrl: string;
            SmtpMailerUrl: string;
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
  '/openauth-pwdinstance/{id}': {
    /** Obtain status and resource URLs for an openauth-pwd instance */
    get: {
      parameters: {
        path: {
          /** Name of the openauth-pwd instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the openauth-pwd instance */
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
            UserDbUrl: string;
            SmtpMailerUrl: string;
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
    /** Stop and remove an openauth-pwd instance */
    delete: {
      parameters: {
        path: {
          /** Name of the openauth-pwd instance */
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
    /** Return status of openauth-pwd instance */
    get: {
      parameters: {
        path: {
          /** Name of the openauth-pwd instance */
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
    /** Return the latest logs from the openauth-pwd instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the openauth-pwd instance */
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
    /** Return the exposed extra ports for openauth-pwd instance */
    get: {
      parameters: {
        path: {
          /** Name of the openauth-pwd instance */
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

export type EyevinnOpenauthPwd =
  paths['/openauth-pwdinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnOpenauthPwdConfig =
  paths['/openauth-pwdinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-openauth-pwd
 * @description Boost your cybersecurity with OpenAuth Password Service! This ready-to-deploy solution empowers your authentication processes using a reliable CouchDB database and seamless email verification for impervious ID security.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://docs.osaas.io/osaas.wiki/Service:-OpenAuth-Password.html|Online docs} for further information
 */

/**
 * @typedef {Object} EyevinnOpenauthPwdConfig
 * @property {string} name - Name of openauth-pwd
 * @property {string} UserDbUrl - UserDbUrl
 * @property {string} SmtpMailerUrl - SmtpMailerUrl

 * 
 */

/**
 * @typedef {Object} EyevinnOpenauthPwd
 * @property {string} name - Name of the OpenAuth Password instance
 * @property {string} url - URL of the OpenAuth Password instance
 *
 */

/**
 * Create a new OpenAuth Password instance
 *
 * @memberOf eyevinn-openauth-pwd
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnOpenauthPwdConfig} body - Service instance configuration
 * @returns {EyevinnOpenauthPwd} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createEyevinnOpenauthPwdInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: EyevinnOpenauthPwdConfig = { name: 'myinstance', ... };
 * const instance = await createEyevinnOpenauthPwdInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createEyevinnOpenauthPwdInstance(
  ctx: Context,
  body: EyevinnOpenauthPwdConfig
): Promise<EyevinnOpenauthPwd> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-openauth-pwd'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-openauth-pwd',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-openauth-pwd', instance.name, ctx);
  return instance;
}

/**
 * Remove a OpenAuth Password instance
 *
 * @memberOf eyevinn-openauth-pwd
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the authservice to be removed
 */
export async function removeEyevinnOpenauthPwdInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-openauth-pwd'
  );
  await removeInstance(ctx, 'eyevinn-openauth-pwd', name, serviceAccessToken);
}

/**
 * Get a OpenAuth Password instance
 *
 * @memberOf eyevinn-openauth-pwd
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the authservice to be retrieved
 * @returns {EyevinnOpenauthPwd} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getEyevinnOpenauthPwdInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getEyevinnOpenauthPwdInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getEyevinnOpenauthPwdInstance(
  ctx: Context,
  name: string
): Promise<EyevinnOpenauthPwd> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-openauth-pwd'
  );
  return await getInstance(
    ctx,
    'eyevinn-openauth-pwd',
    name,
    serviceAccessToken
  );
}
