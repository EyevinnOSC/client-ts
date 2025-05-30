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
  '/ai-code-reviewerinstance': {
    /** List all running ai-code-reviewer instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the ai-code-reviewer instance */
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
            OpenAiApiKey: string;
            AssistantId?: string;
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
    /** Launch a new ai-code-reviewer instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the ai-code-reviewer instance */
            name: string;
            OpenAiApiKey: string;
            AssistantId?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the ai-code-reviewer instance */
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
            OpenAiApiKey: string;
            AssistantId?: string;
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
  '/ai-code-reviewerinstance/{id}': {
    /** Obtain status and resource URLs for an ai-code-reviewer instance */
    get: {
      parameters: {
        path: {
          /** Name of the ai-code-reviewer instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the ai-code-reviewer instance */
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
            OpenAiApiKey: string;
            AssistantId?: string;
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
    /** Stop and remove an ai-code-reviewer instance */
    delete: {
      parameters: {
        path: {
          /** Name of the ai-code-reviewer instance */
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
    /** Return status of ai-code-reviewer instance */
    get: {
      parameters: {
        path: {
          /** Name of the ai-code-reviewer instance */
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
    /** Return the latest logs from the ai-code-reviewer instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the ai-code-reviewer instance */
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
    /** Return the exposed extra ports for ai-code-reviewer instance */
    get: {
      parameters: {
        path: {
          /** Name of the ai-code-reviewer instance */
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

export type EyevinnAiCodeReviewer =
  paths['/ai-code-reviewerinstance/{id}']['get']['responses']['200']['schema'];

export type EyevinnAiCodeReviewerConfig =
  paths['/ai-code-reviewerinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace eyevinn-ai-code-reviewer
 * @description Elevate your code quality with AI Code Reviewer! Leverage AI to review your code effortlessly, ensuring top-notch quality. Integrate easily with your cloud setup for seamless code enhancement.
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} EyevinnAiCodeReviewerConfig
 * @property {string} name - Name of ai-code-reviewer
 * @property {string} OpenAiApiKey - OpenAiApiKey
 * @property {string} [AssistantId] - AssistantId

 * 
 */

/**
 * @typedef {Object} EyevinnAiCodeReviewer
 * @property {string} name - Name of the AI Code Reviewer instance
 * @property {string} url - URL of the AI Code Reviewer instance
 *
 */

/**
 * Create a new AI Code Reviewer instance
 *
 * @memberOf eyevinn-ai-code-reviewer
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {EyevinnAiCodeReviewerConfig} body - Service instance configuration
 * @returns {EyevinnAiCodeReviewer} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createEyevinnAiCodeReviewerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: EyevinnAiCodeReviewerConfig = { name: 'myinstance', ... };
 * const instance = await createEyevinnAiCodeReviewerInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createEyevinnAiCodeReviewerInstance(
  ctx: Context,
  body: EyevinnAiCodeReviewerConfig
): Promise<EyevinnAiCodeReviewer> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-ai-code-reviewer'
  );
  const instance = await createInstance(
    ctx,
    'eyevinn-ai-code-reviewer',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('eyevinn-ai-code-reviewer', instance.name, ctx);
  return instance;
}

/**
 * Remove a AI Code Reviewer instance
 *
 * @memberOf eyevinn-ai-code-reviewer
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the code-reviewer to be removed
 */
export async function removeEyevinnAiCodeReviewerInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-ai-code-reviewer'
  );
  await removeInstance(
    ctx,
    'eyevinn-ai-code-reviewer',
    name,
    serviceAccessToken
  );
}

/**
 * Get a AI Code Reviewer instance
 *
 * @memberOf eyevinn-ai-code-reviewer
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the code-reviewer to be retrieved
 * @returns {EyevinnAiCodeReviewer} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getEyevinnAiCodeReviewerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getEyevinnAiCodeReviewerInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getEyevinnAiCodeReviewerInstance(
  ctx: Context,
  name: string
): Promise<EyevinnAiCodeReviewer> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-ai-code-reviewer'
  );
  return await getInstance(
    ctx,
    'eyevinn-ai-code-reviewer',
    name,
    serviceAccessToken
  );
}
