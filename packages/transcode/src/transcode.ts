import { Context, Log } from '@osaas/client-core';
import { getEncoreInstance } from '@osaas/client-services';
import { range } from './util';

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
  noReconnect?: boolean;
  seekTo?: number;
  duration?: number;
  audioMixPreset?: string;
  insertCreationDateUtc?: boolean;
}

export interface CustomEndpoint {
  endpointUrl: URL;
  bearerToken?: string;
  beaderTokenHeader?: string;
}

function isValidSmpteTimecode(smpteTimeCode: string): boolean {
  const smpteRegex = /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d):([0-2]\d|3[0-1])$/;
  return smpteRegex.test(smpteTimeCode);
}

function formatUtcDateString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
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
 * @property {boolean} [noReconnect] - Do not reconnect to the input stream on network errors
 * @property {number} [seekTo] - Seek to this position (in seconds) in the input file
 * @property {number} [duration] - Duration (in seconds) to transcode from the seek position
 * @property {string} [audioMixPreset] - Audio mix preset to use (e.g., "stereo", "5.1-surround")
 * @property {boolean} [insertCreationDateUtc] - Insert the current UTC date as creation date in the output metadata
 */

/**
 * @typedef {object} CustomEndpoint
 * @property {URL} endpointUrl - The URL to the custom Encore endpoint
 * @property {string} [bearerToken] - The bearer token to use for authentication
 * @property {string} [beaderTokenHeader] - The header name for the bearer token (default: Authorization)
 */
/**
 * Transcode a video file using SVT Encore in Eyevinn Open Source Cloud
 *
 * @memberof module:@osaas/client-transcode
 * @param ctx - Eyevinn OSC context
 * @param {TranscodeOptions} opts - Transcode options
 * @param {CustomEndpoint} [endpoint] - Use a custom Encore endpoint (optional)
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
 *
 * @example
 * // Using a custom Encore endpoint
 * const job = await transcode(ctx, {
 *   encoreInstanceName: 'dummy',
 *   profile: 'program',
 *   externalId: 'tutorial',
 *   outputUrl: new URL('s3://output/tutorial/'),
 *   inputUrl: new URL('s3://input/VINN.mp4'),
 * }, {
 *  endpointUrl: new URL('https://my-custom-encore-endpoint.example.com/'),
 * });
 * console.log(job);
 */
export async function transcode(
  ctx: Context,
  opts: TranscodeOptions,
  endpoint?: CustomEndpoint
) {
  const baseName = opts.baseName || opts.externalId;
  const profile =
    opts.profile || (!opts.injectIDRKeyFrames ? 'program' : 'program-kf');
  if (opts.injectIDRKeyFrames && !opts.frameRate) {
    throw new Error('frameRate is required when injecting IDR key frames');
  }
  let endpointUrl: string;
  let bearerToken: string | undefined;
  let bearerTokenHeader = 'Authorization';
  if (!endpoint) {
    const instance = await getEncoreInstance(ctx, opts.encoreInstanceName);
    if (!instance) {
      throw new Error(`Encore instance ${opts.encoreInstanceName} not found`);
    }
    bearerToken = await ctx.getServiceAccessToken('encore');
    endpointUrl = instance.url;
  } else {
    endpointUrl = endpoint.endpointUrl.toString();
    bearerToken = endpoint.bearerToken;
    if (endpoint.beaderTokenHeader) {
      bearerTokenHeader = endpoint.beaderTokenHeader;
    }
  }
  if (opts.inputUrl.protocol !== 's3:' && opts.inputUrl.protocol !== 'https:') {
    throw new Error('inputUrl must be an S3 or HTTPS URL');
  }
  if (opts.outputUrl.protocol !== 's3:') {
    throw new Error('outputUrl must be an S3 URL');
  }
  let params = {};
  if (!opts.noReconnect) {
    params = {
      reconnect: '1',
      reconnect_on_network_error: '1'
    };
  }
  const encoreJob: any = {
    externalId: opts.externalId,
    profile,
    baseName,
    outputFolder: opts.outputUrl.toString(),
    seekTo: opts.seekTo,
    duration: opts.duration,
    inputs: [
      {
        type: 'AudioVideo',
        copyTs: true,
        uri: opts.inputUrl.toString(),
        params
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
  if (opts.audioMixPreset) {
    encoreJob['profileParams'] = {
      ...encoreJob['profileParams'],
      audioMixPreset: opts.audioMixPreset
    };
  }
  if (opts.callBackUrl) {
    encoreJob['progressCallbackUri'] = opts.callBackUrl.toString();
  }
  if (opts.insertCreationDateUtc) {
    encoreJob['profileParams'] = {
      ...encoreJob['profileParams'],
      utcnowstring: formatUtcDateString()
    };
  }
  const headers: { [name: string]: string | string[] } = {
    'Content-Type': 'application/json'
  };
  if (bearerToken) {
    headers[bearerTokenHeader] = `Bearer ${bearerToken}`;
  }
  const response = await fetch(new URL('/encoreJobs', endpointUrl), {
    method: 'POST',
    headers,
    body: JSON.stringify(encoreJob)
  });
  if (!response.ok) {
    throw new Error(`Failed to create Encore job: ${response.statusText}`);
  }
  const job = await response.json();
  Log().debug(job);
  return job;
}

/**
 * Get details of an SVT Encore transcode job in Eyevinn Open Source Cloud
 *
 * @memberof module:@osaas/client-transcode
 * @param ctx - Eyevinn OSC context
 * @param {string} instanceName - Name of Encore instance
 * @param {string} jobId - Id of the Encore job
 * @param {CustomEndpoint} [endpoint] - Use a custom Encore endpoint (optional)
 * @returns {Job} - The Encore job
 *
 * @example
 * const job = await getTranscodeJob(ctx, 'tutorial', 'fb2baa17-8972-451b-bb1e-1bc773283476');
 * console.log(job);
 */
export async function getTranscodeJob(
  ctx: Context,
  instanceName: string,
  jobId: string,
  endpoint?: CustomEndpoint
) {
  let endpointUrl: string;
  let bearerTokenHeader = 'Authorization';
  let bearerToken: string | undefined;
  if (!endpoint) {
    const instance = await getEncoreInstance(ctx, instanceName);
    if (!instance) {
      throw new Error(`Encore instance ${instanceName} not found`);
    }
    endpointUrl = instance.url;
    bearerToken = await ctx.getServiceAccessToken('encore');
  } else {
    endpointUrl = endpoint.endpointUrl.toString();
    bearerToken = endpoint.bearerToken;
    if (endpoint.beaderTokenHeader) {
      bearerTokenHeader = endpoint.beaderTokenHeader;
    }
  }
  const headers: { [name: string]: string | string[] } = {};
  if (bearerToken) {
    headers[bearerTokenHeader] = `Bearer ${bearerToken}`;
  }
  const response = await fetch(new URL(`/encoreJobs/${jobId}`, endpointUrl), {
    headers
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Encore job ${jobId} not found`);
    }
    throw new Error(`Failed to get Encore job: ${response.status}`);
  }
  const job = await response.json();
  return job;
}

interface JobList {
  _embedded: {
    encoreJobs: any[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: 0;
  };
}

/**
 * Get a list of all SVT Encore transcode job in Eyevinn Open Source Cloud
 *
 * @memberof module:@osaas/client-transcode
 * @param ctx - Eyevinn OSC context
 * @param {string} instanceName - Name of Encore instance
 * @param {CustomEndpoint} [endpoint] - Use a custom Encore endpoint (optional)
 * @returns {Job[]} - List of Encore jobs
 *
 * @example
 * const jobs = await listTranscodeJobs(ctx, 'tutorial');
 * console.log(jobs);
 */
export async function listTranscodeJobs(
  ctx: Context,
  instanceName: string,
  endpoint?: CustomEndpoint
) {
  let endpointUrl: string;
  let bearerTokenHeader = 'Authorization';
  let bearerToken: string | undefined;
  if (!endpoint) {
    const instance = await getEncoreInstance(ctx, instanceName);
    if (!instance) {
      throw new Error(`Encore instance ${instanceName} not found`);
    }
    bearerToken = await ctx.getServiceAccessToken('encore');
    endpointUrl = instance.url;
  } else {
    endpointUrl = endpoint.endpointUrl.toString();
    bearerToken = endpoint.bearerToken;
    if (endpoint.beaderTokenHeader) {
      bearerTokenHeader = endpoint.beaderTokenHeader;
    }
  }
  const headers: { [name: string]: string | string[] } = {};
  if (bearerToken) {
    headers[bearerTokenHeader] = `Bearer ${bearerToken}`;
  }
  const response = await fetch(new URL('/encoreJobs', endpointUrl), {
    headers
  });
  if (!response.ok) {
    throw new Error(`Failed to list Encore jobs: ${response.status}`);
  }
  const jobList = (await response.json()) as JobList;
  Log().debug(jobList);
  const jobs = jobList._embedded.encoreJobs;
  if (jobList.page.totalPages > 1) {
    for (const page of range(1, jobList.page.totalPages, 1)) {
      const response = await fetch(
        new URL(`/encoreJobs?page=${page}`, endpointUrl),
        {
          headers
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to list Encore jobs: ${response.status}`);
      }
      const pageJobs = (await response.json()) as JobList;
      jobs.push(...pageJobs._embedded.encoreJobs);
    }
  }
  return jobs;
}
