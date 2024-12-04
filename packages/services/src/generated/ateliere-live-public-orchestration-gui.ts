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
  '/orchestration-guiinstance': {
    /** List all running orchestration-gui instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the orchestration-gui instance */
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
            MongoDbUri: string;
            ApiUrl: string;
            ApiCredentials: string;
            NextAuthSecret?: string;
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
    /** Launch a new orchestration-gui instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the orchestration-gui instance */
            name: string;
            MongoDbUri: string;
            ApiUrl: string;
            ApiCredentials: string;
            NextAuthSecret?: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the orchestration-gui instance */
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
            MongoDbUri: string;
            ApiUrl: string;
            ApiCredentials: string;
            NextAuthSecret?: string;
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
  '/orchestration-guiinstance/{id}': {
    /** Obtain status and resource URLs for an orchestration-gui instance */
    get: {
      parameters: {
        path: {
          /** Name of the orchestration-gui instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the orchestration-gui instance */
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
            MongoDbUri: string;
            ApiUrl: string;
            ApiCredentials: string;
            NextAuthSecret?: string;
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
    /** Stop and remove an orchestration-gui instance */
    delete: {
      parameters: {
        path: {
          /** Name of the orchestration-gui instance */
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
    /** Return status of orchestration-gui instance */
    get: {
      parameters: {
        path: {
          /** Name of the orchestration-gui instance */
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
    /** Return the latest logs from the orchestration-gui instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the orchestration-gui instance */
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
    /** Return the exposed extra ports for orchestration-gui instance */
    get: {
      parameters: {
        path: {
          /** Name of the orchestration-gui instance */
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

export type AteliereLivePublicOrchestrationGui =
  paths['/orchestration-guiinstance/{id}']['get']['responses']['200']['schema'];

export type AteliereLivePublicOrchestrationGuiConfig =
  paths['/orchestration-guiinstance']['post']['parameters']['body']['body'];

import { Context, createInstance } from '@osaas/client-core';

export async function createAteliereLivePublicOrchestrationGuiInstance(
  ctx: Context,
  body: AteliereLivePublicOrchestrationGuiConfig
): Promise<AteliereLivePublicOrchestrationGui> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'ateliere-live-public-orchestration-gui'
  );
  return await createInstance(
    ctx,
    'ateliere-live-public-orchestration-gui',
    serviceAccessToken,
    body
  );
}
