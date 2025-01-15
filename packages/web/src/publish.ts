import { Context, Log, isValidInstanceName } from '@osaas/client-core';
import { createStorageBucket, uploadFile } from './bucket';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { statSync } from 'fs';

export async function publish(name: string, dir: string, ctx: Context) {
  if (!isValidInstanceName(name)) {
    throw new Error(
      `Invalid website identifier (lowercase letters and numbers allowed): ${name}`
    );
  }
  const bucket = await createStorageBucket(name, ctx);
  Log().debug(bucket);
  const files = await readdir(dir, { recursive: true });
  for (const file of files.filter((f) => f !== '.git')) {
    if (!statSync(join(dir, file)).isDirectory()) {
      await uploadFile(join(dir, file), file, bucket);
    }
  }
}
