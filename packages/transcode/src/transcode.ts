import { Context, Log } from '@osaas/client-core';
import { getEncoreInstance } from '@osaas/client-services';

export interface IDRKeyFrame {
  smpteTimeCode: string;
}

export interface TranscodeOptions {
  encoreInstanceName: string;
  externalId: string;
  inputUrl: URL;
  outputUrl: URL;
  callBackUrl?: URL;
  baseName?: string;
  profile?: string;
  frameRate?: number;
  injectIDRKeyFrames?: IDRKeyFrame[];
}

function isValidSmpteTimecode(smpteTimeCode: string): boolean {
  const smpteRegex = /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d):([0-2]\d|3[0-1])$/;
  return smpteRegex.test(smpteTimeCode);
}

export function smpteTimecodeToFrames(
  smpteTimeCode: string,
  frameRate: number
): number {
  const [hours, minutes, seconds, frames] = smpteTimeCode
    .split(':')
    .map(Number);

  const totalFrames =
    (hours * 3600 + minutes * 60 + seconds) * frameRate + frames;
  return totalFrames;
}

/**
 * @typedef {object} TranscodeOptions
 * @property {string} encoreInstanceName - The name of the Encore instance
 * @property {string} externalId - External Id for external backreference
 * @property {URL} inputUrl - URL to the input file (S3 and HTTPS supported)
 * @property {URL} outputUrl - URL to the output folder (S3 supported)
 * @property {URL} [callBackUrl] - Callback URL to receive progress
 * @property {string} [baseName] - Base name for the output files (prefix)
 * @property {string} [profile] - Profile to use for transcoding
 * @property {number} [frameRate] - Frame rate of the input video (required when injecting IDR key frames)
 * @property {IDRKeyFrame[]} [injectIDRKeyFrames] - List of SMPTE timecodes for IDR key frames
 */

/**
 * Transcode a video file using SVT Encore in Eyevinn Open Source Cloud
 *
 * @memberof module:@osaas/client-transcode
 * @param ctx - Eyevinn OSC context
 * @param {TranscodeOptions} opts - Transcode options
 * @returns {Job} - The created Encore job
 *
 * @example
 * const job = await transcode(ctx, {
 *   encoreInstanceName: 'tutorial',
 *    profile: 'program',
 *    externalId: 'tutorial',
 *    outputUrl: new URL('s3://output/tutorial/'),
 *    inputUrl: new URL('s3://input/VINN.mp4')
 *  });
 *  console.log(job);
 */
export async function transcode(ctx: Context, opts: TranscodeOptions) {
  const baseName = opts.baseName || opts.externalId;
  const profile =
    opts.profile || (!opts.injectIDRKeyFrames ? 'program' : 'program-kf');
  if (opts.injectIDRKeyFrames && !opts.frameRate) {
    throw new Error('frameRate is required when injecting IDR key frames');
  }
  const instance = await getEncoreInstance(ctx, opts.encoreInstanceName);
  if (!instance) {
    throw new Error(`Encore instance ${opts.encoreInstanceName} not found`);
  }
  const serviceAccessToken = await ctx.getServiceAccessToken('encore');
  if (opts.inputUrl.protocol !== 's3:' && opts.inputUrl.protocol !== 'https:') {
    throw new Error('inputUrl must be an S3 or HTTPS URL');
  }
  if (opts.outputUrl.protocol !== 's3:') {
    throw new Error('outputUrl must be an S3 URL');
  }
  const encoreJob: any = {
    externalId: opts.externalId,
    profile,
    baseName,
    outputFolder: opts.outputUrl.toString(),
    inputs: [
      {
        type: 'AudioVideo',
        copyTs: true,
        uri: opts.inputUrl.toString()
      }
    ]
  };
  if (opts.injectIDRKeyFrames && opts.frameRate) {
    if (
      opts.injectIDRKeyFrames.every((kf) =>
        isValidSmpteTimecode(kf.smpteTimeCode)
      )
    ) {
      const frameRate = opts.frameRate;
      const keyframes = opts.injectIDRKeyFrames.map((kf) =>
        smpteTimecodeToFrames(kf.smpteTimeCode, frameRate)
      );
      encoreJob['profileParams'] = {
        keyframes:
          `expr:not(mod(n,96))` + keyframes.map((f) => `+eq(n,${f})`).join('')
      };
    } else {
      throw new Error('Invalid SMPTE timecode in IDR keyframe list');
    }
  }
  if (opts.callBackUrl) {
    encoreJob['progressCallbackUri'] = opts.callBackUrl.toString();
  }
  const response = await fetch(new URL('/encoreJobs', instance.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceAccessToken}`
    },
    body: JSON.stringify(encoreJob)
  });
  if (!response.ok) {
    throw new Error(`Failed to create Encore job: ${response.statusText}`);
  }
  const job = await response.json();
  Log().debug(job);
  return job;
}
