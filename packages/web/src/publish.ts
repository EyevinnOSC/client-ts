import { Context, isValidInstanceName } from '@osaas/client-core';
import {
  Bucket,
  createStorageBucket,
  removeBucketContents,
  uploadFile
} from './bucket';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { statSync } from 'fs';

export interface PublishOpts {
  sync?: boolean;
}

export interface Website {
  name: string;
  url: string;
  bucket: Bucket;
}

/**
 * Publish options
 * @typedef PublishOpts
 * @type object
 * @property {boolean} [sync] - If true, clear bucket before uploading new files
 */

/**
 * Publish a static website using Eyevinn Open Source Cloud Storage
 *
 * @memberof module:@osaas/client-web
 * @async
 * @param name - Name of the website
 * @param dir - Directory to publish
 * @param ctx - Open Source Cloud configuration context
 * @param {PublishOpts} [opts] - Publish options
 * @returns name and url of the published website
 */
export async function publish(
  name: string,
  dir: string,
  ctx: Context,
  opts?: PublishOpts
) {
  if (!isValidInstanceName(name)) {
    throw new Error(
      `Invalid website identifier (lowercase letters and numbers allowed): ${name}`
    );
  }
  const sync = opts?.sync || false;
  const bucket = await createStorageBucket(name, ctx);
  if (sync) {
    await removeBucketContents(bucket);
  }
  const files = await readdir(dir, { recursive: true });
  for (const file of files.filter((f) => f !== '.git')) {
    if (!statSync(join(dir, file)).isDirectory()) {
      await uploadFile(join(dir, file), file, bucket);
    }
  }
  return {
    name,
    url: bucket.endpoint + '/' + bucket.name + '/index.html',
    bucket
  };
}
