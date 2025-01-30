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
  '/docker-minecraft-serverinstance': {
    /** List all running docker-minecraft-server instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the docker-minecraft-server instance */
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
            AcceptEula: boolean;
            RconPassword: string;
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
    /** Launch a new docker-minecraft-server instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the docker-minecraft-server instance */
            name: string;
            AcceptEula: boolean;
            RconPassword: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the docker-minecraft-server instance */
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
            AcceptEula: boolean;
            RconPassword: string;
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
  '/docker-minecraft-serverinstance/{id}': {
    /** Obtain status and resource URLs for an docker-minecraft-server instance */
    get: {
      parameters: {
        path: {
          /** Name of the docker-minecraft-server instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the docker-minecraft-server instance */
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
            AcceptEula: boolean;
            RconPassword: string;
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
    /** Stop and remove an docker-minecraft-server instance */
    delete: {
      parameters: {
        path: {
          /** Name of the docker-minecraft-server instance */
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
    /** Return status of docker-minecraft-server instance */
    get: {
      parameters: {
        path: {
          /** Name of the docker-minecraft-server instance */
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
    /** Return the latest logs from the docker-minecraft-server instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the docker-minecraft-server instance */
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
    /** Return the exposed extra ports for docker-minecraft-server instance */
    get: {
      parameters: {
        path: {
          /** Name of the docker-minecraft-server instance */
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

export type ItzgDockerMinecraftServer =
  paths['/docker-minecraft-serverinstance/{id}']['get']['responses']['200']['schema'];

export type ItzgDockerMinecraftServerConfig =
  paths['/docker-minecraft-serverinstance']['post']['parameters']['body']['body'];

/** @namespace itzg-docker-minecraft-server */
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';

/**
 * Create a new Minecraft Server instance
 *
 * @memberOf itzg-docker-minecraft-server
 * @description Experience seamless Minecraft server management with our Docker solution! Easily deploy, customize, and scale your servers with robust support for different versions, mods, and plugins. Perfect for dedicated gamers and server admins alike!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {ItzgDockerMinecraftServerConfig}} body - Service instance configuration
 * @returns {ItzgDockerMinecraftServer} - Service instance
 * @example
 * import { Context, createItzgDockerMinecraftServerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await createItzgDockerMinecraftServerInstance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function createItzgDockerMinecraftServerInstance(
  ctx: Context,
  body: ItzgDockerMinecraftServerConfig
): Promise<ItzgDockerMinecraftServer> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'itzg-docker-minecraft-server'
  );
  const instance = await createInstance(
    ctx,
    'itzg-docker-minecraft-server',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady(
    'itzg-docker-minecraft-server',
    instance.name,
    ctx
  );
  return instance;
}

/**
 * Remove a Minecraft Server instance
 *
 * @memberOf itzg-docker-minecraft-server
 * @description Experience seamless Minecraft server management with our Docker solution! Easily deploy, customize, and scale your servers with robust support for different versions, mods, and plugins. Perfect for dedicated gamers and server admins alike!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the minecraft-server to be removed
 */
export async function removeItzgDockerMinecraftServerInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'itzg-docker-minecraft-server'
  );
  await removeInstance(
    ctx,
    'itzg-docker-minecraft-server',
    name,
    serviceAccessToken
  );
}

/**
 * Get a Minecraft Server instance
 *
 * @memberOf itzg-docker-minecraft-server
 * @description Experience seamless Minecraft server management with our Docker solution! Easily deploy, customize, and scale your servers with robust support for different versions, mods, and plugins. Perfect for dedicated gamers and server admins alike!
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the minecraft-server to be retrieved
 * @returns {ItzgDockerMinecraftServer} - Service instance
 */
export async function getItzgDockerMinecraftServerInstance(
  ctx: Context,
  name: string
): Promise<ItzgDockerMinecraftServer> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'itzg-docker-minecraft-server'
  );
  return await getInstance(
    ctx,
    'itzg-docker-minecraft-server',
    name,
    serviceAccessToken
  );
}
