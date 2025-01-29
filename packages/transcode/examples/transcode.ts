import { Context } from '@osaas/client-core';
import { transcode } from '../src/index';

async function main() {
  const ctx = new Context();

  try {
    const job = await transcode(ctx, {
      encoreInstanceName: 'tutorial',
      externalId: 'example',
      outputUrl: new URL('s3://output/tutorial/'),
      inputUrl: new URL('s3://input/VINN.mp4'),
      injectIDRKeyFrames: [{ smpteTimeCode: '00:10:00:00' }],
      frameRate: 25
    });
    console.log(job);
  } catch (err) {
    console.error(err);
  }
}

main();
