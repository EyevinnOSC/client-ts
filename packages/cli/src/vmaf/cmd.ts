import { Context, Log } from '@osaas/client-core';
import { vmafCompare } from '@osaas/client-transcode';
import { Command } from 'commander';

export default function cmdCompare() {
  const compare = new Command('compare');

  compare
    .command('vmaf')
    .description('Compare two video files using VMAF')
    .argument(
      '<reference>',
      'URL to reference video file (supported protocols: s3)'
    )
    .argument(
      '<distorted>',
      'URL to distorted video file (supported protocols: s3)'
    )
    .argument(
      '<result>',
      'URL where to store the result (supported protocols: s3)'
    )
    .option(
      '--aws-access-key-id <awsAccessKeyId>',
      'AWS Access Key ID (overrides AWS_ACCESS_KEY_ID env var)'
    )
    .option(
      '--aws-secret-access-key <awsSecretAccessKey>',
      'AWS Secret Access Key (overrides AWS_SECRET_ACCESS_KEY env var)'
    )
    .option(
      '--aws-session-token <awsSessionToken>',
      'AWS Session Token (overrides AWS_SESSION_TOKEN env var)'
    )
    .option(
      '--s3-endpoint-url <s3EndpointUrl>',
      'S3 Endpoint URL (overrides S3_ENDPOINT_URL env var)'
    )
    .action(async (reference, distorted, result, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const resultUrl = await vmafCompare(
          ctx,
          new URL(reference),
          new URL(distorted),
          new URL(result),
          {
            awsAccessKeyId:
              options.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID,
            awsSecretAccessKey:
              options.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
            awsSessionToken:
              options.awsSessionToken || process.env.AWS_SESSION_TOKEN,
            s3EndpointUrl: options.s3EndpointUrl || process.env.S3_ENDPOINT_URL
          }
        );
        Log().info(`VMAF comparison result stored at ${resultUrl.toString()}`);
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return compare;
}
