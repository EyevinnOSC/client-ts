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
  '/hls-viewerinstance': {
    /** List all running hls-viewer instances */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the hls-viewer instance */
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
    /** Launch a new hls-viewer instance */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the hls-viewer instance */
            name: string;
          };
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the hls-viewer instance */
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
  '/hls-viewerinstance/{id}': {
    /** Obtain status and resource URLs for an hls-viewer instance */
    get: {
      parameters: {
        path: {
          /** Name of the hls-viewer instance */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Name of the hls-viewer instance */
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
    /** Stop and remove an hls-viewer instance */
    delete: {
      parameters: {
        path: {
          /** Name of the hls-viewer instance */
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
    /** Return status of hls-viewer instance */
    get: {
      parameters: {
        path: {
          /** Name of the hls-viewer instance */
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
    /** Return the latest logs from the hls-viewer instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Name of the hls-viewer instance */
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
    /** Return the exposed extra ports for hls-viewer instance */
    get: {
      parameters: {
        path: {
          /** Name of the hls-viewer instance */
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

export type NfrederiksenHlsViewer =
  paths['/hls-viewerinstance/{id}']['get']['responses']['200']['schema'];

export type NfrederiksenHlsViewerConfig =
  paths['/hls-viewerinstance']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace nfrederiksen-hls-viewer
 * @description Effortlessly inspect and analyze HLS playlist manifests directly in your browser. No installation needed—just paste your URL and dive into comprehensive metrics with ease. Ideal for streamlined streaming analysis!
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 *
 */

/**
 * @typedef {Object} NfrederiksenHlsViewerConfig
 * @property {string} name - Name of hls-viewer

 * 
 */

/**
 * @typedef {Object} NfrederiksenHlsViewer
 * @property {string} name - Name of the HLS Playlist Viewer instance
 * @property {string} url - URL of the HLS Playlist Viewer instance
 *
 */

/**
 * Create a new HLS Playlist Viewer instance
 *
 * @memberOf nfrederiksen-hls-viewer
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {NfrederiksenHlsViewerConfig} body - Service instance configuration
 * @returns {NfrederiksenHlsViewer} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createNfrederiksenHlsViewerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: NfrederiksenHlsViewerConfig = { name: 'myinstance', ... };
 * const instance = await createNfrederiksenHlsViewerInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createNfrederiksenHlsViewerInstance(
  ctx: Context,
  body: NfrederiksenHlsViewerConfig
): Promise<NfrederiksenHlsViewer> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'nfrederiksen-hls-viewer'
  );
  const instance = await createInstance(
    ctx,
    'nfrederiksen-hls-viewer',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('nfrederiksen-hls-viewer', instance.name, ctx);
  return instance;
}

/**
 * Remove a HLS Playlist Viewer instance
 *
 * @memberOf nfrederiksen-hls-viewer
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the viewer to be removed
 */
export async function removeNfrederiksenHlsViewerInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'nfrederiksen-hls-viewer'
  );
  await removeInstance(
    ctx,
    'nfrederiksen-hls-viewer',
    name,
    serviceAccessToken
  );
}

/**
 * Get a HLS Playlist Viewer instance
 *
 * @memberOf nfrederiksen-hls-viewer
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the viewer to be retrieved
 * @returns {NfrederiksenHlsViewer} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getNfrederiksenHlsViewerInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getNfrederiksenHlsViewerInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getNfrederiksenHlsViewerInstance(
  ctx: Context,
  name: string
): Promise<NfrederiksenHlsViewer> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'nfrederiksen-hls-viewer'
  );
  return await getInstance(
    ctx,
    'nfrederiksen-hls-viewer',
    name,
    serviceAccessToken
  );
}
