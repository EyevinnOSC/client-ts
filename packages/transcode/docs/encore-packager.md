# EncorePackager Queue Contract

## Overview

`EncorePackager` (and `EncoreTransfer`) are Redis queue consumers. They pop messages from a Redis **sorted set** using `BZPOPMIN` (blocking sorted-set pop). The sort score is `Date.now()` (epoch ms), so messages are processed in insertion order.

## Queue Message Format

Derived from `encore-packager/src/redisListener.ts` (TypeBox schema):

```typescript
interface QueueMessage {
  jobId: string; // Encore job ID (UUID)
  url: string; // Full URL to the Encore job resource
  // e.g. https://<encore-url>/encoreJobs/<jobId>
}
```

This is exactly what `encore-callback-listener` pushes on `SUCCESSFUL`:

```typescript
{ jobId: jobProgress.jobId, url: `${encoreUrl}/encoreJobs/${jobProgress.jobId}` }
```

## Redis Data Structure

The queue is a **sorted set** (not a list). Pop command:

```
BZPOPMIN <queueName> <timeout-seconds>
```

The queue name defaults to `package` in the VOD pipeline and is configurable via the `RedisQueue` option on both `EncorePackager` and `EncoreTransfer`.

> **Important**: Consumers using `BLPOP` will silently never receive messages because `BLPOP` operates on lists, not sorted sets.

## What EncorePackager Does

After popping a message, `EncorePackager`:

1. Fetches the full Encore job from `url`
2. Validates `status === 'SUCCESSFUL'`
3. Reads the `output[]` array (VideoFile / AudioFile entries)
4. Runs Shaka Packager (S3) to produce HLS/DASH output

The `EncoreJob` shape it expects at that URL:

```typescript
interface EncoreJob {
  id: string;
  externalId?: string;
  status: string; // must be 'SUCCESSFUL'
  inputs: { uri: string }[];
  output?: {
    type: string; // 'VideoFile' | 'AudioFile'
    format: string;
    file: string;
    fileSize: number;
    overallBitrate: number;
    videoStreams?: { codec: string; bitrate: number }[];
    audioStreams?: { codec: string; bitrate: number; channels: number }[];
  }[];
}
```

## Building an Alternative Consumer

Any process that:

1. Connects to the same Redis instance
2. Issues `BZPOPMIN <queueName>` in a loop
3. Parses the JSON `QueueMessage`
4. Fetches `url` to get the full job detail

...is a valid alternative consumer. The sorted-set pop is destructive (first popper wins), so only one consumer processes each message.

## Concurrency

`EncorePackager` tracks in-flight jobs and skips popping when `noProcessing >= concurrency` (default: 1). Alternative consumers should implement similar back-pressure.
