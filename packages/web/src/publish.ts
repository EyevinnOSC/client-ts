import { Context, isValidInstanceName } from '@osaas/client-core';
import {
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
}
