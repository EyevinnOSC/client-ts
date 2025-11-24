import {
  Context,
  Log,
  createJob,
  waitForJobToComplete
} from '@osaas/client-core';
import path from 'node:path';

/**
 * Options for VMAF comparison
 *
 * @memberof module:@osaas/client-transcode
 * @typedef {Object} VmafCompareOptions
 * @property {string} [awsAccessKeyId] - AWS Access Key ID
 * @property {string} [awsSecretAccessKey] - AWS Secret Access Key
 * @property {string} [awsSessionToken] - AWS Session Token
 * @property {string} [s3EndpointUrl] - S3 Endpoint URL
 */
export interface VmafCompareOptions {
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsSessionToken?: string;
  s3EndpointUrl?: string;
}

/**
 * Compare two video files using VMAF
 *
 * @async
 * @memberof module:@osaas/client-transcode
 * @param {Context} ctx - Open Source Cloud configuration context
 * @param {URL} reference - URL to reference video file (supported protocols: s3)
 * @param {URL} distorted - URL to distorted video file (supported protocols: s3)
 * @param {URL} resultBucket - URL to S3 bucket where result file will be stored
 * @param {VmafCompareOptions} [opts] - Options for VMAF comparison
 * @returns S3 URL to result file
 * @example
 * import { Context } from '@osaas/client-core';
 * import { vmafCompare } from '@osaas/client-transcode';
 *
 * const ctx = new Context();
 * const reference = new URL('s3://video/reference.mp4');
 * const distorted = new URL('s3://video/distorted.mp4');
 * const resultBucket = new URL('s3://video/results');
 * const resultFile = await vmafCompare(ctx, reference, distorted, resultBucket);
 */
export async function vmafCompare(
  ctx: Context,
  reference: URL,
  distorted: URL,
  resultBucket: URL,
  opts: VmafCompareOptions = {}
): Promise<URL> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-easyvmaf-s3'
  );
  const jobId = Math.random().toString(36).substring(7);
  const resultFile = `${resultBucket
    .toString()
    .replace(/\/$/, '')}/${path.basename(distorted.pathname)}_${jobId}.json`;

  if (!opts.awsAccessKeyId || !opts.awsSecretAccessKey) {
    throw new Error('AWS credentials not set');
  }
  const job = await createJob(ctx, 'eyevinn-easyvmaf-s3', serviceAccessToken, {
    name: jobId,
    AwsAccessKeyId: opts.awsAccessKeyId,
    AwsSecretAccessKey: opts.awsSecretAccessKey,
    AwsSessionToken: opts.awsSessionToken,
    S3EndpointUrl: opts.s3EndpointUrl,
    cmdLineArgs: `-r ${reference.toString()} -d ${distorted.toString()} -o ${resultFile}`
  });
  Log().debug(
    `Comparing file ${reference.toString()} with ${reference.toString()}`
  );
  await waitForJobToComplete(
    ctx,
    'eyevinn-easyvmaf-s3',
    job.name,
    serviceAccessToken
  );
  Log().debug(`VMAF comparison ${job.name} completed`);
  return new URL(resultFile);
}
