import {
  Context,
  Log,
  createFetch,
  createInstance,
  getInstance,
  getPortsForInstance,
  listInstances,
  removeInstance
} from '@osaas/client-core';
import { delay } from './util';

/**
 * Create live multi-bitrate HLS encoder
 *
 * @memberof module:@osaas/client-transcode
 * @async
 * @param ctx - Eyevinn OSC context
 * @param name - name of the encoder
 * @param streamKey - optional stream key
 * @returns  RTMP and HLS URLs
 */
export async function createLiveMultiBitrateHLS(
  ctx: Context,
  name: string,
  streamKey?: string
): Promise<{ rtmpUrl: URL; hlsUrl: URL }> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-live-encoding'
  );

  await createInstance(ctx, 'eyevinn-live-encoding', serviceAccessToken, {
    name,
    HlsOnly: true,
    StreamKey: streamKey
  });
  await delay(8000);

  const encoding = await startLiveMultiBitrateHLS(ctx, name);
  await delay(1000);
  if (!encoding) {
    throw new Error('Failed to start live encoding');
  }
  return {
    rtmpUrl: encoding.rtmpUrl,
    hlsUrl: encoding.hlsUrl
  };
}

/**
 * Start live multi-bitrate HLS encoding
 *
 * @memberof module:@osaas/client-transcode
 * @async
 * @param ctx - Eyevinn OSC context
 * @param name - name of the encoder
 * @returns RTMP and HLS URLs
 */

export async function startLiveMultiBitrateHLS(
  ctx: Context,
  name: string
): Promise<{ rtmpUrl: URL; hlsUrl: URL }> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-live-encoding'
  );
  const encoder = await getInstance(
    ctx,
    'eyevinn-live-encoding',
    name,
    serviceAccessToken
  );
  if (encoder) {
    const ports = await getPortsForInstance(
      ctx,
      'eyevinn-live-encoding',
      encoder.name,
      serviceAccessToken
    );
    const rtmpPort = ports.find((port) => port.internalPort == 1935);
    if (!rtmpPort) {
      throw new Error('Instance has no RTMP port mapped');
    }

    const encoding = await createFetch<{ streamKey: string; playlist: string }>(
      new URL(encoder.url + '/api/encoder'),
      {
        method: 'POST',
        headers: {
          'x-jwt': `Bearer ${serviceAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ timeout: 0 })
      }
    );
    await delay(5000);
    const status = await createFetch<any>(
      new URL(encoder.url + '/api/encoder'),
      {
        method: 'GET',
        headers: {
          'x-jwt': `Bearer ${serviceAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    Log().debug(status);
    if (status.status != 'starting') {
      throw new Error('Failed to start encoder');
    }
    Log().debug(encoding);
    return {
      rtmpUrl: new URL(
        `rtmp://${rtmpPort.externalIp}:${rtmpPort.externalPort}/live/${encoding.streamKey}`
      ),
      hlsUrl: new URL(encoder.url + encoding.playlist)
    };
  } else {
    throw new Error('Encoder not found');
  }
}

/**
 * Stop live multi-bitrate HLS encoding
 *
 * @memberof module:@osaas/client-transcode
 * @async
 * @param ctx - Eyevinn OSC context
 * @param name - name of the encoder
 */
export async function stopLiveMultiBitrateHLS(ctx: Context, name: string) {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-live-encoding'
  );
  const encoder = await getInstance(
    ctx,
    'eyevinn-live-encoding',
    name,
    serviceAccessToken
  );
  if (encoder) {
    await createFetch<any>(new URL(encoder.url + '/api/encoder'), {
      method: 'DELETE',
      headers: {
        'x-jwt': `Bearer ${serviceAccessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function createLiveSingleBitrateHLS(
  ctx: Context,
  name: string
): Promise<{ rtmpUrl: URL; hlsUrl: URL }> {
  const serviceAccessToken = await ctx.getServiceAccessToken('ossrs-srs');

  const encoder = await createInstance(ctx, 'ossrs-srs', serviceAccessToken, {
    name
  });
  const ports = await getPortsForInstance(
    ctx,
    'ossrs-srs',
    encoder.name,
    serviceAccessToken
  );
  const rtmpPort = ports.find((port) => port.internalPort == 1935);
  if (!rtmpPort) {
    throw new Error('Instance has no RTMP port mapped');
  }
  return {
    rtmpUrl: new URL(
      `rtmp://${rtmpPort.externalIp}:${rtmpPort.externalPort}/live/livestream`
    ),
    hlsUrl: new URL(encoder.url + '/live/livestream.m3u8')
  };
}

export async function removeLiveSingleBitrateHLS(ctx: Context, name: string) {
  const serviceAccessToken = await ctx.getServiceAccessToken('ossrs-srs');
  await removeInstance(ctx, 'ossrs-srs', name, serviceAccessToken);
}

export async function listSingleBitrateHLS(
  ctx: Context
): Promise<{ name: string; hlsUrl: URL }[]> {
  const serviceAccessToken = await ctx.getServiceAccessToken('ossrs-srs');

  const instances = await listInstances(ctx, 'ossrs-srs', serviceAccessToken);
  return instances.map((instance: { name: string; url: string }) => {
    return {
      name: instance.name,
      hlsUrl: new URL(instance.url + '/live/livestream.m3u8')
    };
  });
}
