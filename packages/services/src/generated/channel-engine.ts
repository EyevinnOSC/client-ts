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
  '/channel': {
    /** List all running FAST channels */
    get: {
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Channel Id */
            id: string;
            /** @description Name of the channel */
            name: string;
            /** @enum {string} */
            type: 'Loop' | 'Playlist' | 'WebHook' | 'Barker';
            /** @description URL to playlist, VOD to loop or webhook */
            url: string;
          }[];
        };
      };
    };
    /** Launch a new FAST channel */
    post: {
      parameters: {
        body: {
          body?: {
            /** @description Name of the channel */
            name: string;
            /** @enum {string} */
            type: 'Loop' | 'Playlist' | 'WebHook' | 'Barker';
            /** @description URL to playlist or VOD to loop */
            url: string;
            opts?: {
              /** @description Use demuxed audio (default is true) */
              useDemuxedAudio?: boolean;
              /** @description Use VTT subtitles (default is true) */
              useVttSubtitles?: boolean;
              /** @description URI to default slate */
              defaultSlateUri?: string;
              /** @description Comma separated list of languages, e.g. ("en,ja"). First one is defined to be default */
              langList?: string;
              /** @description Comma separated list of subtitle languages, e.g. ("en,ja"). First one is defined to be default */
              langListSubs?: string;
              /** @description Channel preset. Available presets are: DD, HEVC, ATMOS */
              preset?: string;
              preroll?: {
                /** @description URL to preroll */
                url: string;
                /** @description Duration of preroll in milliseconds */
                duration: number;
              };
              webhook?: {
                /** @description API key for webhook */
                apikey?: string;
              };
            };
          };
        };
      };
      responses: {
        /** Default Response */
        201: {
          schema: {
            /** @description Channel Id */
            id: string;
            /** @description Name of the channel */
            name: string;
            /** @enum {string} */
            type: 'Loop' | 'Playlist' | 'WebHook' | 'Barker';
            /** @description URL to playlist or VOD to loop */
            url: string;
            opts?: {
              /** @description Use demuxed audio (default is true) */
              useDemuxedAudio?: boolean;
              /** @description Use VTT subtitles (default is true) */
              useVttSubtitles?: boolean;
              /** @description URI to default slate */
              defaultSlateUri?: string;
              /** @description Comma separated list of languages, e.g. ("en,ja"). First one is defined to be default */
              langList?: string;
              /** @description Comma separated list of subtitle languages, e.g. ("en,ja"). First one is defined to be default */
              langListSubs?: string;
              /** @description Channel preset. Available presets are: DD, HEVC, ATMOS */
              preset?: string;
              preroll?: {
                /** @description URL to preroll */
                url: string;
                /** @description Duration of preroll in milliseconds */
                duration: number;
              };
              webhook?: {
                /** @description API key for webhook */
                apikey?: string;
              };
            };
            /** @description Playback URL */
            playback: string;
          };
        };
      };
    };
  };
  '/channel/{id}': {
    /** Obtain status and playback URL for a FAST channel */
    get: {
      parameters: {
        path: {
          /** Channel Id */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Channel Id */
            id: string;
            /** @description Name of the channel */
            name: string;
            /** @enum {string} */
            type: 'Loop' | 'Playlist' | 'WebHook' | 'Barker';
            /** @description URL to playlist, VOD to loop or webhook */
            url: string;
          };
        };
      };
    };
    /** Stop and remove a FAST channel */
    delete: {
      parameters: {
        path: {
          /** Channel Id */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        204: {
          schema: string;
        };
      };
    };
  };
  '/health/{id}': {
    /** Channel health check */
    get: {
      parameters: {
        path: {
          /** Channel Id */
          id: string;
        };
      };
      responses: {
        /** Default Response */
        200: {
          schema: {
            /** @description Health of the channel */
            health: string;
            /** @description Status of the channel */
            status: string;
          };
        };
      };
    };
  };
  '/logs/{id}': {
    /** Return the latest logs from a channel-engine instance */
    get: {
      parameters: {
        query: {
          timestamps?: boolean;
          sinceSeconds?: number;
        };
        path: {
          /** Channel Id */
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
          schema: string;
        };
      };
    };
  };
}

export interface definitions {}

export interface operations {}

export interface external {}

export type ChannelEngine =
  paths['/channel/{id}']['get']['responses']['200']['schema'];

export type ChannelEngineConfig =
  paths['/channel']['post']['parameters']['body']['body'];
import {
  Context,
  createInstance,
  waitForInstanceReady,
  removeInstance,
  getInstance
} from '@osaas/client-core';
/**
 * @namespace channel-engine
 * @description Based on VOD2Live Technology you can generate a numerous amounts of FAST channels with a fraction of energy consumption compared to live transcoded FAST channels
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright 2025 Eyevinn Technology AB
 * @see {@link https://docs.osaas.io/osaas.wiki/Service:-FAST-Channel-Engine.html|Online docs} for further information
 */

/**
 * @typedef {Object} ChannelEngineConfig
 * @property {string} name - Enter channel name
 * @property {enum} type - Plugin type
 * @property {string} url - URL of VOD, playlist to loop or WebHook
 * @property {boolean} [opts.useDemuxedAudio] - Use demuxed audio
 * @property {boolean} [opts.useVttSubtitles] - Use VTT subtitles
 * @property {string} [opts.defaultSlateUri] - URI to default slate
 * @property {list} [opts.langList] - Comma separated list of languages
 * @property {list} [opts.langListSubs] - Comma separated list of subtitle languages
 * @property {enum} [opts.preset] - Channel preset
 * @property {string} [opts.preroll.url] - URL to preroll
 * @property {string} [opts.preroll.duration] - Duration of preroll in milliseconds
 * @property {string} [opts.webhook.apikey] - WebHook api key

 * 
 */

/**
 * @typedef {Object} ChannelEngine
 * @property {string} name - Name of the FAST Channel Engine instance
 * @property {string} url - URL of the FAST Channel Engine instance
 *
 */

/**
 * Create a new FAST Channel Engine instance
 *
 * @memberOf channel-engine
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {ChannelEngineConfig} body - Service instance configuration
 * @returns {ChannelEngine} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createChannelEngineInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const body: ChannelEngineConfig = { name: 'myinstance', ... };
 * const instance = await createChannelEngineInstance(ctx, body);
 * console.log(instance.url);
 */
export async function createChannelEngineInstance(
  ctx: Context,
  body: ChannelEngineConfig
): Promise<ChannelEngine> {
  const serviceAccessToken = await ctx.getServiceAccessToken('channel-engine');
  const instance = await createInstance(
    ctx,
    'channel-engine',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('channel-engine', instance.name, ctx);
  return instance;
}

/**
 * Remove a FAST Channel Engine instance
 *
 * @memberOf channel-engine
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the channel to be removed
 */
export async function removeChannelEngineInstance(
  ctx: Context,
  name: string
): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken('channel-engine');
  await removeInstance(ctx, 'channel-engine', name, serviceAccessToken);
}

/**
 * Get a FAST Channel Engine instance
 *
 * @memberOf channel-engine
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the channel to be retrieved
 * @returns {ChannelEngine} - Service instance
 * @example
 * import { Context } from '@osaas/client-core';
 * import { getChannelEngineInstance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await getChannelEngineInstance(ctx, 'myinstance');
 * console.log(instance.url);
 */
export async function getChannelEngineInstance(
  ctx: Context,
  name: string
): Promise<ChannelEngine> {
  const serviceAccessToken = await ctx.getServiceAccessToken('channel-engine');
  return await getInstance(ctx, 'channel-engine', name, serviceAccessToken);
}
