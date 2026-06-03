import { Context, Log } from '@osaas/client-core';
import {
  createEyevinnFunctionProbeInstance,
  removeEyevinnFunctionProbeInstance
} from '@osaas/client-services';

/**
 * Probe result from eyevinn-function-probe
 *
 * @memberof module:@osaas/client-transcode
 * @typedef {Object} ProbeResult
 * @property {any} format - Container format information
 * @property {any[]} streams - Audio and video stream details
 */
export interface ProbeResult {
  format: any;
  streams: any[];
}

/**
 * Probe a media file or stream and return its metadata
 *
 * Creates a temporary eyevinn-function-probe instance, fetches media info for
 * the given URL, then removes the instance. The instance name is derived from a
 * short random suffix to avoid collisions.
 *
 * @async
 * @memberof module:@osaas/client-transcode
 * @param {Context} ctx - Open Source Cloud configuration context
 * @param {string} inputUrl - URL of the media file or stream to probe (HTTP/HTTPS or S3)
 * @returns {ProbeResult} - Probe result containing format and stream metadata
 * @example
 * import { Context } from '@osaas/client-core';
 * import { probeFile } from '@osaas/client-transcode';
 *
 * const ctx = new Context();
 * const info = await probeFile(ctx, 'https://example.com/video.mp4');
 * console.log(info.format.duration);
 */
export async function probeFile(
  ctx: Context,
  inputUrl: string
): Promise<ProbeResult> {
  const instanceName = `probe-${Math.random().toString(36).substring(2, 8)}`;
  Log().debug(`Creating probe instance ${instanceName} for ${inputUrl}`);

  const instance = await createEyevinnFunctionProbeInstance(ctx, {
    name: instanceName
  });

  try {
    const probeUrl = new URL('/probe', instance.url);
    probeUrl.searchParams.set('url', inputUrl);

    const response = await fetch(probeUrl.toString());
    if (!response.ok) {
      throw new Error(
        `Probe request failed with status ${response.status}: ${response.statusText}`
      );
    }
    const result = (await response.json()) as ProbeResult;
    Log().debug(`Probe complete for ${inputUrl}`);
    return result;
  } finally {
    await removeEyevinnFunctionProbeInstance(ctx, instanceName);
    Log().debug(`Removed probe instance ${instanceName}`);
  }
}
