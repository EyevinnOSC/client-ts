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
  '/player-analytics-eventsinkinstance': {
    /** List all running player-analytics-eventsink instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the player-analytics-eventsink instance */
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
            SqsQueueUrl: string;
            AwsAccessKeyId: string;
            AwsSecretAccessKey: string;
            SqsEndpoint?: string;
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
    /** Launch a new player-analytics-eventsink instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the player-analytics-eventsink instance */
            name: string;
            SqsQueueUrl: string;
            AwsAccessKeyId: string;
            AwsSecretAccessKey: string;
            SqsEndpoint?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the player-analytics-eventsink instance */
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
            SqsQueueUrl: string;
            AwsAccessKeyId: string;
            AwsSecretAccessKey: string;
            SqsEndpoint?: string;
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
  '/player-analytics-eventsinkinstance/{id}': {
    /** Obtain status and resource URLs for an player-analytics-eventsink instance */
    get: {
      parameters: {
        path: {
          /** Name of the player-analytics-eventsink instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the player-analytics-eventsink instance */
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
            SqsQueueUrl: string;
            AwsAccessKeyId: string;
            AwsSecretAccessKey: string;
            SqsEndpoint?: string;
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
    /** Stop and remove an player-analytics-eventsink instance */
    delete: {
      parameters: {
        path: {
          /** Name of the player-analytics-eventsink instance */
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
    /** Return status of player-analytics-eventsink instance */
    get: {
      parameters: {
        path: {
          /** Name of the player-analytics-eventsink instance */
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
    /** Return the latest logs from the player-analytics-eventsink instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the player-analytics-eventsink instance */
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
    /** Return the exposed extra ports for player-analytics-eventsink instance */
    get: {
      parameters: {
        path: {
          /** Name of the player-analytics-eventsink instance */
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

export type EyevinnPlayerAnalyticsEventsink =
  paths['/player-analytics-eventsinkinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnPlayerAnalyticsEventsinkConfig =
  paths['/player-analytics-eventsinkinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-player-analytics-eventsink
 * @description Unlock seamless video analytics with Eyevinn Player Analytics Eventsink! Streamline data collection from video players and enhance performance insights. Experience modular flexibility and AWS integration today!
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://docs.osaas.io/osaas.wiki/Service:-Player-Analytics-Eventsink.html|Online docs} for further information
 */

/**
 * @typedef {Object} EyevinnPlayerAnalyticsEventsinkConfig
 * @property {string} name - Name of player-analytics-eventsink
 * @property {string} SqsQueueUrl - SqsQueueUrl
 * @property {string} AwsAccessKeyId - AwsAccessKeyId
 * @property {string} AwsSecretAccessKey - AwsSecretAccessKey
 * @property {string} [SqsEndpoint] - SqsEndpoint

 * 
 */

/**
 * @typedef {Object} EyevinnPlayerAnalyticsEventsink
 * @property {string} name - Name of the Player Analytics Eventsink instance
 * @property {string} url - URL of the Player Analytics Eventsink instance
 *
 */

/**
 * Create a new Player Analytics Eventsink instance
 *
 * @memberOf eyevinn-player-analytics-eventsink
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnPlayerAnalyticsEventsinkConfig} body - Service instance configuration
 * @returns {EyevinnPlayerAnalyticsEventsink} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createEyevinnPlayerAnalyticsEventsinkInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: EyevinnPlayerAnalyticsEventsinkConfig = { name: 'myinstance', ... };
 * const instance = await createEyevinnPlayerAnalyticsEventsinkInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createEyevinnPlayerAnalyticsEventsinkInstance(
  ctx: Context,
  body: EyevinnPlayerAnalyticsEventsinkConfig
): Promise<EyevinnPlayerAnalyticsEventsink> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-player-analytics-eventsink'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-player-analytics-eventsink',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady(
    'eyevinn-player-analytics-eventsink',
    instance.name,
    ctx
  );
  return instance;
}

/**
 * Remove a Player Analytics Eventsink instance
 *
 * @memberOf eyevinn-player-analytics-eventsink
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the eventsink to be removed
 */
export async function removeEyevinnPlayerAnalyticsEventsinkInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-player-analytics-eventsink'
  );
  await removeInstance(
    ctx,
    'eyevinn-player-analytics-eventsink',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Player Analytics Eventsink instance
 *
 * @memberOf eyevinn-player-analytics-eventsink
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the eventsink to be retrieved
 * @returns {EyevinnPlayerAnalyticsEventsink} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getEyevinnPlayerAnalyticsEventsinkInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getEyevinnPlayerAnalyticsEventsinkInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getEyevinnPlayerAnalyticsEventsinkInstance(
  ctx: Context,
  name: string
): Promise<EyevinnPlayerAnalyticsEventsink> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-player-analytics-eventsink'
  );
  return await getInstance(
    ctx,
    'eyevinn-player-analytics-eventsink',
    name,
    serviceAccessToken
  );
}
