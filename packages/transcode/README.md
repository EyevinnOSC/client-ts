# @osaas/client-transcode

SDK for transcoding with Encore in Open Source Cloud and transfer result to S3 bucket

- [SDK Reference Documentation](https://js.docs.osaas.io)

## Usage

Prerequisites

- An account on [Eyevinn Open Source Cloud](www.osaas.io)
- Business subscription with 5 services remaining

```
npm install --save @osaas/client-transcode
```

### Create a VOD

Example code to setup a VOD pipeline and create a VOD

```javascript
import { Context, Log } from '@osaas/client-core';
import { createVod, createVodPipeline } from '@osaas/client-transcode';

async function main() {
  const ctx = new Context();

  try {
    const ctx = new Context({ environment });
    Log().info('Creating VOD pipeline');
    const pipeline = await createVodPipeline(name, ctx);
    Log().info('VOD pipeline created, starting job to create VOD');
    const job = await createVod(pipeline, source, ctx);
    if (job) {
      Log().info('Created VOD will be available at: ' + job.vodUrl);
    }
  } catch (err) {
    Log().error(err);
  }
}

main();
```

### Transcode a video and inject IDR keyframes at a specific timecode

```javascript
import { Context } from '@osaas/client-core';
import { transcode } from '@osaas/client-transcode';

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
```

## About Open Source Cloud

Open Source Cloud reduces the barrier to get started with open source without having to host it on your own infrastructure.

Start building software solutions based on open and detachable ready-to-run cloud components with Open Source Cloud. Full code transparency, never locked in and a business model that contributes back to the open source community. Offering a wide range of components from media and more to help you build the best solution for you and your users.

www.osaas.io
