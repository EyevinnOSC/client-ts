import { Context } from '@osaas/client-core';
import { createVodPipeline, createVod, removeVodPipeline } from '../src';

async function main() {
  const ctx = new Context();
  const pipeline = await createVodPipeline('testpipe', ctx, {
    createInputBucket: true
  });
  console.log(pipeline);
  /*
  const vod = await createVod(pipeline, 's3://testpipeinput/VINN.mp4', ctx);
  console.log(vod);
  */
  await removeVodPipeline('testpipe', ctx);
}

main();
