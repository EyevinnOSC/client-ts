import { Context, Log } from '@osaas/client-core';
import {
  createVod,
  createVodPipeline,
  removeVodPipeline
} from '@osaas/client-transcode';
import { getPipeline } from '@osaas/client-transcode/lib/vodpipeline';
import { Command } from 'commander';

export function cmdVod() {
  const vod = new Command('vod');
  vod
    .command('create')
    .description(
      'Create a VOD file ready for streaming. Will setup pipeline if not already created.'
    )
    .argument('<name>', 'Name of VOD Pipeline')
    .argument('<source>', 'Source URL')
    .option(
      '--profile <profile>',
      'Transcoding profile to use [default: program]'
    )
    .option('--output-bucket-name <name>', 'Name of existing output bucket')
    .option('--access-key-id <id>', 'Access key ID for existing output bucket')
    .option(
      '--secret-access-key <key>',
      'Secret access key for existing output bucket'
    )
    .option('--endpoint <url>', 'Endpoint URL for existing output bucket')
    .action(async (name, source, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const opts = {
          outputBucketName: options.outputBucketName,
          accessKeyId: options.accessKeyId,
          secretAccessKey: options.secretAccessKey,
          endpoint: options.endpoint
        };
        let pipeline = await getPipeline(name, ctx, opts);
        if (!pipeline) {
          Log().info('Creating VOD pipeline');
          pipeline = await createVodPipeline(name, ctx, opts);
          Log().info('VOD pipeline created, starting job to create VOD');
        } else {
          Log().info('Using existing VOD pipeline, starting job to create VOD');
          Log().debug(pipeline);
        }
        const vodOptions = {
          profile: options.profile
        };
        const job = await createVod(pipeline, source, ctx, vodOptions);
        if (job) {
          Log().info('Created VOD will be available at: ' + job.vodUrl);
        }
      } catch (err) {
        console.log((err as Error).message);
      }
    });

  vod
    .command('cleanup')
    .description('Remove VOD pipeline but keep VOD files')
    .argument('<name>', 'Name of VOD Pipeline')
    .action(async (name, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        Log().info('Removing VOD pipeline');
        await removeVodPipeline(name, ctx);
        Log().info('VOD pipeline removed');
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return vod;
}
