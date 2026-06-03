# Encore Callback Payload

## Overview

The `progressCallbackUri` field on an Encore job points to the `POST /encoreCallback` endpoint exposed by an `encore-callback-listener` instance. Encore calls this endpoint on every job status transition.

## Callback Payload

Derived from `encore-callback-listener/src/encoreCallbackApi.ts`:

```typescript
interface JobProgress {
  jobId: string;
  externalId?: string; // optional — set on the job at creation
  progress: number; // 0–100
  status: string; // see status enum below
}
```

## Status Enum

`NEW | QUEUED | IN_PROGRESS | SUCCESSFUL | FAILED | CANCELLED`

## When It Fires

Encore calls `progressCallbackUri` on every status change. The callback listener only acts on `SUCCESSFUL` (case-insensitive comparison: `status.toUpperCase() === 'SUCCESSFUL'`).

## What the Listener Does

- On `SUCCESSFUL`: publishes a queue message to Redis (see [encore-packager.md](./encore-packager.md))
- All other statuses: logged but otherwise dropped — nothing is enqueued

**Note**: The SVT Encore upstream docs at svt.github.io/encore-doc do not document the callback payload shape. The authoritative source is `encore-callback-listener/src/encoreCallbackApi.ts` (TypeBox schema).

**Note**: The `progress` field (0–100) is present in the callback payload but not used by the listener logic. It is informational only.

**Note**: `externalId` is optional — it is set at job creation time. If the caller omits it, the callback will not carry it.

## Test Example

```bash
curl -X POST https://<listener-url>/encoreCallback \
  -H 'Content-Type: application/json' \
  -d '{"jobId":"abc123","externalId":"myjob-xyz","progress":100,"status":"SUCCESSFUL"}'
```
