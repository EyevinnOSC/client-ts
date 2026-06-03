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

## Advanced: Direct Encore Job Submission

For cases where you need full control over the Encore job payload — custom profiles, multi-input jobs, subtitle tracks, or non-S3 output locations — you can submit jobs directly to the Encore REST API using `transcode()` with a `CustomEndpoint`, or via the raw `fetch` path.

See the [Encore API documentation](https://svt.github.io/encore-doc/) for the full schema reference.

### Request Shape

```typescript
interface EncoreJobInput {
  type: 'AudioVideo' | 'Audio' | 'Video';
  uri: string; // S3 or HTTPS URL
  copyTs?: boolean;
  params?: Record<string, string>; // e.g. reconnect flags
}

interface EncoreJobRequest {
  externalId: string;
  profile: string; // e.g. 'program', 'program-kf'
  baseName: string; // output file prefix
  outputFolder: string; // S3 URL
  inputs: EncoreJobInput[];
  seekTo?: number; // seconds
  duration?: number; // seconds
  progressCallbackUri?: string;
  profileParams?: {
    keyframes?: string; // FFmpeg expr for IDR injection
    audioMixPreset?: string; // e.g. 'stereo', '5.1-surround'
    utcnowstring?: string; // UTC creation date string
  };
}
```

### Response Shape

The Encore API follows Spring HATEOAS conventions. The response from `POST /encoreJobs` contains:

```typescript
interface EncoreJobResponse {
  id: string; // UUID
  externalId: string;
  status:
    | 'NEW'
    | 'QUEUED'
    | 'IN_PROGRESS'
    | 'SUCCESSFUL'
    | 'FAILED'
    | 'CANCELLED';
  profile: string;
  baseName: string;
  outputFolder: string;
  inputs: EncoreJobInput[];
  output?: FileOutput[];
  startedDate?: string; // ISO 8601
  completedDate?: string;
  message?: string; // error details on FAILED
  _links: {
    self: { href: string };
    encoreJob: { href: string };
  };
}
```

`FileOutput` is exported from `@osaas/client-transcode`.

### Error Codes

| HTTP status | Meaning                                                         |
| ----------- | --------------------------------------------------------------- |
| `400`       | Invalid job payload (missing required fields, bad profile name) |
| `401`       | Missing or invalid bearer token                                 |
| `404`       | Encore instance not found (when resolving via OSC)              |
| `409`       | Job with same `externalId` already exists                       |
| `500`       | Encore internal error — check `message` field in response       |

The SDK throws a plain `Error` for non-2xx responses with the status text in the message.

### Callback Wiring End-to-End

Encore notifies completion by POSTing the finished job to a `progressCallbackUri`. The `EncoreCallbackListener` class (exported from `@osaas/client-transcode`) manages the callback receiver as an OSC service instance backed by Redis/Valkey.

```typescript
import { Context } from '@osaas/client-core';
import { ValkeyDb } from '@osaas/client-db';
import { transcode, EncoreCallbackListener } from '@osaas/client-transcode';

async function main() {
  const ctx = new Context();

  // 1. Provision a Redis queue for callback events
  const queue = new ValkeyDb({ context: ctx, name: 'transfer' });
  const redisUrl = await queue.getRedisUrl();

  // 2. Create (or reuse) the callback listener — it exposes /encoreCallback
  const callback = new EncoreCallbackListener({
    context: ctx,
    name: 'my-listener',
    redisUrl: redisUrl.toString(),
    redisQueue: 'jobs-done',
    encoreUrl: 'https://<encore-instance>.encore.prod.osaas.io'
  });
  await callback.init();
  const callbackUrl = callback.getCallbackUrl();

  // 3. Submit the job with the callback URL
  const job = await transcode(ctx, {
    encoreInstanceName: 'my-encore',
    externalId: 'example-001',
    inputUrl: new URL('s3://input/video.mp4'),
    outputUrl: new URL('s3://output/example-001/'),
    profile: 'program',
    callBackUrl: new URL(callbackUrl!)
  });

  console.log('Job submitted:', job.id);

  // 4. Encore will POST the completed job to callbackUrl.
  //    The listener forwards the event to Redis for EncoreTransfer to process.

  // Teardown (optional — reuse the listener across jobs in production)
  await callback.destroy();
  await queue.destroy();
}

main();
```

Key points:

- The listener instance persists across job submissions — `init()` is idempotent.
- `redisQueue` defaults to undefined; specify it explicitly when pairing with `EncoreTransfer`.
- The callback URL path is always `/encoreCallback` appended to the instance URL.

## About Open Source Cloud

Open Source Cloud reduces the barrier to get started with open source without having to host it on your own infrastructure.

Start building software solutions based on open and detachable ready-to-run cloud components with Open Source Cloud. Full code transparency, never locked in and a business model that contributes back to the open source community. Offering a wide range of components from media and more to help you build the best solution for you and your users.

www.osaas.io
