import {
  Context,
  getInstance,
  getPortsForInstance,
  isValidInstanceName,
  removeInstance,
  waitForInstanceReady
} from '@osaas/client-core';
import {
  Encore,
  EncoreConfig,
  EyevinnEncoreCallbackListenerConfig,
  EyevinnEncorePackager,
  EyevinnEncorePackagerConfig,
  MinioMinio,
  MinioMinioConfig,
  ValkeyIoValkey,
  ValkeyIoValkeyConfig,
  createEncoreInstance,
  createEyevinnEncoreCallbackListenerInstance,
  createEyevinnEncorePackagerInstance,
  createMinioMinioInstance,
  createValkeyIoValkeyInstance
} from '@osaas/client-services';
import * as Minio from 'minio';
import { delay } from './util';
import { randomBytes } from 'crypto';
import { basename, extname } from 'node:path';

export interface VodPipeline {
  name: string;
  jobs: string;
  callbackUrl: string;
  output: string;
  endpoint: string;
  inputStorage?: StorageBucket;
}

/**
 * VOD pipeline options
 *
 * @typedef VodPipelineOpts
 * @type object
 * @property {boolean} [createInputBucket] - If true, create an input storage bucket (default: false)
 */
export interface VodPipelineOpts {
  createInputBucket?: boolean;
}

/**
 * Storage bucket options
 *
 * @typedef StorageBucketOpts
 * @type object
 * @property {boolean} [private] - If true, create a private bucket (default: false)
 */
export interface StorageBucketOpts {
  private?: boolean;
}

export interface StorageBucket {
  name: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface VodJob {
  id: string;
  vodUrl: string;
}

function createPublicBucketPolicy(name: string) {
  return {
    Statement: [
      {
        Action: ['s3:GetBucketLocation', 's3:ListBucket'],
        Effect: 'Allow',
        Principal: {
          AWS: ['*']
        },
        Resource: [`arn:aws:s3:::${name}`]
      },
      {
        Action: ['s3:GetObject'],
        Effect: 'Allow',
        Principal: {
          AWS: ['*']
        },
        Resource: [`arn:aws:s3:::${name}/*`]
      }
    ],
    Version: '2012-10-17'
  };
}

async function createEncore(
  name: string,
  ctx: Context,
  inputStorage?: StorageBucket
) {
  const sat = await ctx.getServiceAccessToken('encore');
  let instance: Encore = await getInstance(ctx, 'encore', name, sat);
  if (!instance) {
    const config: EncoreConfig = {
      name,
      s3AccessKeyId: inputStorage?.accessKeyId,
      s3SecretAccessKey: inputStorage?.secretAccessKey,
      s3Endpoint: inputStorage?.endpoint
    };
    const newInstance = await createEncoreInstance(ctx, config);
    if (!newInstance) {
      throw new Error('Failed to create new Encore instance');
    }
    instance = newInstance;
    await waitForInstanceReady('encore', name, ctx);
  }
  return {
    jobs: new URL('/encoreJobs', instance.url).toString(),
    url: instance.url.replace(/\/$/, '')
  };
}

async function createRedis(name: string, ctx: Context) {
  const sat = await ctx.getServiceAccessToken('valkey-io-valkey');
  let instance: ValkeyIoValkey = await getInstance(
    ctx,
    'valkey-io-valkey',
    name,
    sat
  );
  if (!instance) {
    const config: ValkeyIoValkeyConfig = { name };
    const newInstance = await createValkeyIoValkeyInstance(ctx, config);
    await waitForInstanceReady('valkey-io-valkey', name, ctx);
    await delay(2000);
    instance = newInstance;
    await waitForInstanceReady('valkey-io-valkey', name, ctx);
  }

  const ports = await getPortsForInstance(ctx, 'valkey-io-valkey', name, sat);
  const redisPort = ports.find((port) => port.internalPort == 6379);
  if (!redisPort) {
    throw new Error(`Failed to get redis port for instance ${name}`);
  }
  return `redis://${redisPort.externalIp}:${redisPort.externalPort}`;
}

async function createCallbackListener(
  name: string,
  redisUrl: string,
  encoreUrl: string,
  ctx: Context
) {
  const sat = await ctx.getServiceAccessToken(
    'eyevinn-encore-callback-listener'
  );
  let instance = await getInstance(
    ctx,
    'eyevinn-encore-callback-listener',
    name,
    sat
  );
  if (!instance) {
    const config: EyevinnEncoreCallbackListenerConfig = {
      name,
      RedisUrl: redisUrl,
      RedisQueue: 'package',
      EncoreUrl: encoreUrl
    };
    const newInstance = await createEyevinnEncoreCallbackListenerInstance(
      ctx,
      config
    );
    if (!newInstance) {
      throw new Error('Failed to create new callback listener instance');
    }
    instance = newInstance;
    await waitForInstanceReady('eyevinn-encore-callback-listener', name, ctx);
  }
  return {
    url: new URL('/encoreCallback', instance.url).toString()
  };
}

async function createPackager(
  name: string,
  redisUrl: string,
  outputFolder: string,
  accessKeyId: string,
  secretAccessKey: string,
  s3EndpointUrl: string,
  ctx: Context
) {
  const sat = await ctx.getServiceAccessToken('eyevinn-encore-packager');
  let instance: EyevinnEncorePackager = await getInstance(
    ctx,
    'eyevinn-encore-packager',
    name,
    sat
  );
  if (!instance) {
    const config: EyevinnEncorePackagerConfig = {
      name,
      RedisUrl: redisUrl,
      RedisQueue: 'package',
      OutputFolder: outputFolder,
      AwsAccessKeyId: accessKeyId,
      AwsSecretAccessKey: secretAccessKey,
      S3EndpointUrl: s3EndpointUrl,
      PersonalAccessToken: '{{secrets.osctoken}}'
    };
    const newInstance = await createEyevinnEncorePackagerInstance(ctx, config);
    if (!newInstance) {
      throw new Error('Failed to create new packager instance');
    }
    instance = newInstance;
    await waitForInstanceReady('eyevinn-encore-packager', name, ctx);
  }
  return instance;
}

async function createStorageBucket(
  name: string,
  ctx: Context,
  opts?: StorageBucketOpts
): Promise<StorageBucket> {
  const sat = await ctx.getServiceAccessToken('minio-minio');
  let instance: MinioMinio = await getInstance(ctx, 'minio-minio', name, sat);
  if (!instance) {
    const rootPassword = randomBytes(16).toString('hex');
    const config: MinioMinioConfig = {
      name,
      RootUser: 'root',
      RootPassword: rootPassword
    };
    const newInstance = await createMinioMinioInstance(ctx, config);
    if (!newInstance) {
      throw new Error('Failed to create new Minio instance');
    }
    instance = newInstance;
    await waitForInstanceReady('minio-minio', name, ctx);
    await delay(2000);

    const minioClient = new Minio.Client({
      endPoint: new URL(instance.url).hostname,
      accessKey: 'root',
      secretKey: instance.RootPassword || ''
    });
    await minioClient.makeBucket(name);
    if (!opts?.private) {
      await minioClient.setBucketPolicy(
        name,
        JSON.stringify(createPublicBucketPolicy(name))
      );
    }
  }

  return {
    name: instance.name,
    endpoint: instance.url,
    accessKeyId: 'root',
    secretAccessKey: instance.RootPassword || ''
  };
}

/**
 * Create a VOD pipeline based on Encore and Shaka Packager
 *
 * @memberof module:@osaas/client-transcode
 * @param name - name of the pipeline
 * @param ctx - Eyevinn OSC context
 * @param {VodPipelineOpts} [opts] - VOD pipeline options
 * @returns {VodPipeline} - VOD pipeline object
 */
export async function createVodPipeline(
  name: string,
  ctx: Context,
  opts?: VodPipelineOpts
): Promise<VodPipeline> {
  if (!isValidInstanceName(name)) {
    throw new Error(`Invalid instance name: ${name}`);
  }
  const storage = await createStorageBucket(name, ctx);
  const redisUrl = await createRedis(name, ctx);
  let inputStorage;
  if (opts?.createInputBucket) {
    inputStorage = await createStorageBucket(name + 'input', ctx, {
      private: true
    });
  }
  const transcoder = await createEncore(name, ctx, inputStorage);
  const encoreCallback = await createCallbackListener(
    name,
    redisUrl,
    transcoder.url,
    ctx
  );
  const packager = await createPackager(
    name,
    redisUrl,
    `s3://${name}/`,
    storage.accessKeyId,
    storage.secretAccessKey,
    storage.endpoint,
    ctx
  );
  return {
    name,
    jobs: transcoder.jobs,
    callbackUrl: encoreCallback.url,
    output: packager.OutputFolder,
    endpoint: storage.endpoint,
    inputStorage
  };
}

/**
 * Remove a VOD pipeline
 *
 * @memberof module:@osaas/client-transcode
 * @param name - name of pipeline to remove
 * @param context - Eyevinn OSC context
 */
export async function removeVodPipeline(name: string, context: Context) {
  await removeInstance(
    context,
    'encore',
    name,
    await context.getServiceAccessToken('encore')
  );
  await removeInstance(
    context,
    'eyevinn-encore-callback-listener',
    name,
    await context.getServiceAccessToken('eyevinn-encore-callback-listener')
  );
  await removeInstance(
    context,
    'eyevinn-encore-packager',
    name,
    await context.getServiceAccessToken('eyevinn-encore-packager')
  );
  await removeInstance(
    context,
    'valkey-io-valkey',
    name,
    await context.getServiceAccessToken('valkey-io-valkey')
  );
}

/**
 * Create a VOD using a VOD pipeline in Eyevinn OSC
 *
 * @memberof module:@osaas/client-transcode
 * @param pipeline - name of the VOD pipeline to use
 * @param source - URL of the source video file
 * @param context - Eyevinn OSC context
 * @returns {VodJob} - VOD job object
 * @example
 * import { Context } from '@osaas/client-core';
 * import { createVod, createVodPipeline } from '@osaas/client-transcode';
 *
 * async function main() {
 *   const ctx = new Context();
 *   const pipeline = await createVodPipeline('sdkexample', ctx);
 *   const vod = await createVod(
 *     pipeline,
 *     'https://testcontent.eyevinn.technology/mp4/VINN.mp4',
 *     ctx
 *   );
 *   console.log(vod);
 * }
 * main();
 */
export async function createVod(
  pipeline: VodPipeline,
  source: string,
  context: Context
) {
  const sat = await context.getServiceAccessToken('encore');
  const externalId =
    pipeline.name + '-' + Math.random().toString(36).substring(7);
  const sourceUrl = new URL(source);
  if (sourceUrl.protocol === 's3:' && !pipeline.inputStorage) {
    throw new Error('Input storage bucket required for S3 input');
  }
  const job = {
    externalId,
    profile: 'program',
    outputFolder: '/usercontent/',
    baseName: externalId,
    progressCallbackUri: pipeline.callbackUrl,
    inputs: [
      {
        uri: source,
        seekTo: 0,
        copyTs: true,
        type: 'AudioVideo'
      }
    ]
  };
  const response = await fetch(pipeline.jobs, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sat}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(job)
  });
  if (response.ok) {
    const createdJob = (await response.json()) as { id: string };
    const sourceName = basename(source, extname(source));
    const vod = {
      id: createdJob.id,
      vodUrl: `${pipeline.endpoint}/${pipeline.name}/${sourceName}/${createdJob.id}/index.m3u8`
    };
    return vod;
  }
  throw new Error(`Failed to create job: ${response.statusText}`);
}
