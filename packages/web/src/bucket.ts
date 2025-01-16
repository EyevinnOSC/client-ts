import {
  Context,
  Log,
  getInstance,
  waitForInstanceReady
} from '@osaas/client-core';
import {
  MinioMinio,
  MinioMinioConfig,
  createMinioMinioInstance
} from '@osaas/client-services';
import { randomBytes } from 'crypto';
import { createReadStream, statSync } from 'fs';
import * as Minio from 'minio';
import mime from 'mime';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface Bucket {
  name: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
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

export async function createStorageBucket(
  name: string,
  ctx: Context
): Promise<Bucket> {
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
    await minioClient.setBucketPolicy(
      name,
      JSON.stringify(createPublicBucketPolicy(name))
    );
  }

  return {
    name: instance.name,
    endpoint: instance.url,
    accessKeyId: 'root',
    secretAccessKey: instance.RootPassword || ''
  };
}

export async function removeBucketContents(bucket: Bucket) {
  Log().debug(`Removing contents on bucket ${bucket.name}`);
  const minioClient = new Minio.Client({
    endPoint: new URL(bucket.endpoint).hostname,
    accessKey: bucket.accessKeyId,
    secretKey: bucket.secretAccessKey
  });

  const p: Promise<string[]> = new Promise((resolve, reject) => {
    const stream = minioClient.listObjects(bucket.name, '', true);
    const objectsToDelete: string[] = [];

    stream.on('data', (obj) => {
      if (obj.name) {
        objectsToDelete.push(obj.name);
      }
    });

    stream.on('end', () => {
      resolve(objectsToDelete);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
  const objectsToDelete = await p;
  Log().debug(`Deleting ${objectsToDelete.length} objects`);
  await minioClient.removeObjects(bucket.name, objectsToDelete);
}

export async function uploadFile(
  source: string,
  dest: string,
  bucket: Bucket
): Promise<void> {
  Log().debug(`Uploading ${source} to ${bucket.name}/${dest}`);
  const fileStream = createReadStream(source);
  const stats = await statSync(source);
  const metadata = { 'Content-Type': mime.getType(source) };
  const minioClient = new Minio.Client({
    endPoint: new URL(bucket.endpoint).hostname,
    accessKey: bucket.accessKeyId,
    secretKey: bucket.secretAccessKey
  });
  await minioClient.putObject(
    bucket.name,
    dest,
    fileStream,
    stats.size,
    metadata
  );
}
