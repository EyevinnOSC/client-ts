import { Context, FetchError, createFetch } from '@osaas/client-core';
import { createReadStream, readdirSync, statSync } from 'fs';
import { basename, join, sep } from 'path';
import FormData from 'form-data';

/**
 * Per-file size cap and per-request file count cap for `osaas-deploy-manager`'s
 * `/mypages` API, mirrored from `MAX_PAGE_FILE_SIZE_BYTES` /
 * `MAX_UPLOAD_FILES_PER_REQUEST` in `Eyevinn/osaas-deploy-manager`'s
 * `src/apps/mypage.ts` (verified against `main`). These are not re-exported by
 * that service, so the values are duplicated here — if the upstream service
 * ever changes them, requests will simply get a 400/413 from the server, which
 * is a safe failure mode.
 */
export const MAX_PAGE_FILE_SIZE_BYTES = 26214400; // 25 MiB
export const MAX_UPLOAD_FILES_PER_REQUEST = 500;
/** Server-side cap on the `files` manifest passed to `/mypages/:id/publish`. */
export const MAX_PAGE_MANIFEST_FILES = 5000;

/** Total time budget for retrying a 503 "storage still starting up" response. */
const NOT_READY_RETRY_BUDGET_MS = 60000;
/** Fallback backoff when the server does not send a usable `Retry-After`. */
const DEFAULT_RETRY_AFTER_SECONDS = 10;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export interface MyPage {
  id: string;
  name: string;
  url: string;
  status: 'draft' | 'live';
}

export interface MyPageUploadFile {
  path: string;
  size: number;
}

export interface MyPageUploadTarget {
  path: string;
  url: string;
  method: 'POST';
  contentType: string;
  fields: Record<string, string>;
}

export interface MyPageUploadUrlsResponse {
  uploads: MyPageUploadTarget[];
  expiresAt: string;
  maxFileSizeBytes: number;
}

export interface MyPagePublishResult extends MyPage {
  prunedCount?: number;
}

/** Thrown when the server responds 503 because the tenant's `mypages` MinIO
 * instance is still starting up. Carries the `Retry-After` value (seconds)
 * so callers can back off accordingly. */
export class MyPageNotReadyError extends FetchError {
  retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super({ message, httpCode: 503 });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

type ErrorFactory = (response: Response) => Promise<FetchError>;

/**
 * Error factory for `/mypages*` endpoints. Behaves like the library default
 * (parses `{ reason }` / `{ message }` JSON bodies, or falls back to raw
 * text) but additionally turns a 503 into a `MyPageNotReadyError` carrying
 * the parsed `Retry-After` header, since the shared `createFetch` error path
 * does not expose response headers to callers.
 */
const mypageErrorFactory: ErrorFactory = async (response) => {
  let message: string;
  if (response.headers.get('content-type')?.includes('application/json')) {
    const body = (await response.json()) as {
      reason?: string;
      message?: string;
    };
    message = body?.message ?? body?.reason ?? JSON.stringify(body);
  } else {
    message = await response.text();
  }

  if (response.status === 503) {
    const retryAfterHeader = response.headers.get('retry-after');
    const parsed = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
    return new MyPageNotReadyError(
      message,
      Number.isFinite(parsed) ? parsed : DEFAULT_RETRY_AFTER_SECONDS
    );
  }

  return new FetchError({ message, httpCode: response.status });
};

function myPagesBaseUrl(ctx: Context): string {
  return `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`;
}

function jsonHeaders(ctx: Context): Record<string, string> {
  return {
    'x-pat-jwt': `Bearer ${ctx.getPersonalAccessToken()}`,
    'Content-Type': 'application/json'
  };
}

const PAGE_NAME_CHARSET_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/**
 * Lightweight client-side pre-check mirroring
 * `validatePageName`/`PAGE_NAME_CHARSET_RE` in
 * `Eyevinn/osaas-deploy-manager`'s `src/apps/mypage.ts`. This exists to fail
 * fast with a clear message before any network call — the server remains the
 * authoritative validator and will still reject an invalid name with a 400.
 */
export function validateMyPageName(name: string): string | undefined {
  if (name.length < 3 || name.length > 52) {
    return `Page name must be between 3 and 52 characters (got ${name.length})`;
  }
  if (!PAGE_NAME_CHARSET_RE.test(name)) {
    return 'Page name must be lowercase letters, numbers, and hyphens only, and must start/end with a letter or number';
  }
  return undefined;
}

/**
 * Create a new My Page site.
 *
 * Retries on 503 (the tenant's dedicated `mypages` MinIO instance is still
 * starting up) using the server's `Retry-After` header, up to a total wait
 * of ~60s. Throws immediately (no retry) on 409 name-collision.
 */
export async function createMyPage(
  name: string,
  ctx: Context
): Promise<MyPage> {
  const url = new URL('/mypages', myPagesBaseUrl(ctx));
  let waitedMs = 0;

  for (;;) {
    try {
      return await createFetch<MyPage>(
        url,
        {
          method: 'POST',
          headers: jsonHeaders(ctx),
          body: JSON.stringify({ name })
        },
        mypageErrorFactory
      );
    } catch (error) {
      if (error instanceof FetchError && error.httpCode === 409) {
        throw new Error(
          `Page name '${name}' is already in use. Choose a different name.`
        );
      }
      if (error instanceof MyPageNotReadyError) {
        const backoffMs = error.retryAfterSeconds * 1000;
        if (waitedMs + backoffMs > NOT_READY_RETRY_BUDGET_MS) {
          throw new Error(
            `My Page storage for '${name}' is still starting up after ${Math.round(
              waitedMs / 1000
            )}s of retries. Try again in a moment. (${error.message})`
          );
        }
        await delay(backoffMs);
        waitedMs += backoffMs;
        continue;
      }
      throw error;
    }
  }
}

/**
 * Mint presigned S3 POST upload targets for a batch of files. `files` must
 * contain at most `MAX_UPLOAD_FILES_PER_REQUEST` entries — chunk larger
 * manifests before calling this.
 */
export async function getPageUploadUrls(
  id: string,
  files: MyPageUploadFile[],
  ctx: Context
): Promise<MyPageUploadUrlsResponse> {
  const url = new URL(`/mypages/${id}/upload-urls`, myPagesBaseUrl(ctx));
  return await createFetch<MyPageUploadUrlsResponse>(
    url,
    {
      method: 'POST',
      headers: jsonHeaders(ctx),
      body: JSON.stringify({ files })
    },
    mypageErrorFactory
  );
}

/**
 * Finalize a publish: server-side copies each `dir/index.html` to `dir/` so
 * directory URLs resolve, marks the site `live`, and (since `prune: true` is
 * always sent here with the complete file manifest) deletes any bucket
 * object that is not part of the current publish.
 */
export async function finalizeMyPagePublish(
  id: string,
  files: string[],
  ctx: Context
): Promise<MyPagePublishResult> {
  const url = new URL(`/mypages/${id}/publish`, myPagesBaseUrl(ctx));
  return await createFetch<MyPagePublishResult>(
    url,
    {
      method: 'POST',
      headers: jsonHeaders(ctx),
      body: JSON.stringify({ files, prune: true })
    },
    mypageErrorFactory
  );
}

/**
 * Upload a single file to a presigned S3 POST target. Builds a multipart
 * form from `target.fields` (appended in order, untouched) with the file
 * appended last under the field name `file`, read as a stream — never
 * base64-encoded or buffered into memory.
 */
export async function uploadFileToPresignedTarget(
  filePath: string,
  target: MyPageUploadTarget
): Promise<void> {
  const form = new FormData();
  for (const [key, value] of Object.entries(target.fields)) {
    form.append(key, value);
  }
  form.append('file', createReadStream(filePath), {
    filename: basename(filePath),
    contentType: target.contentType
  });

  await new Promise<void>((resolve, reject) => {
    form.submit(
      target.url,
      (
        err: Error | null,
        res?: NodeJS.ReadableStream & { statusCode?: number }
      ) => {
        if (err) {
          reject(
            new Error(`Upload of '${target.path}' failed: ${err.message}`)
          );
          return;
        }
        if (!res) {
          reject(new Error(`Upload of '${target.path}' failed: no response`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('error', (streamErr: Error) =>
          reject(
            new Error(`Upload of '${target.path}' failed: ${streamErr.message}`)
          )
        );
        res.on('end', () => {
          const statusCode = res.statusCode ?? 0;
          if (statusCode >= 200 && statusCode < 300) {
            resolve();
          } else {
            const body = Buffer.concat(chunks).toString('utf8');
            reject(
              new Error(
                `Upload of '${target.path}' failed with HTTP ${statusCode}: ${body}`
              )
            );
          }
        });
      }
    );
  });
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/** Recursively list every regular file under `dir`, as site-relative paths
 * using forward slashes (the `/mypages` API rejects backslashes), skipping
 * `.git`. */
function listSiteFiles(dir: string): string[] {
  const entries = readdirSync(dir, { recursive: true }) as string[];
  return entries
    .filter((entry) => entry.split(sep)[0] !== '.git')
    .filter((entry) => !statSync(join(dir, entry)).isDirectory())
    .map((entry) => entry.split(sep).join('/'));
}

export interface MyPagesPublishResult {
  id: string;
  name: string;
  url: string;
}

/**
 * Publish a directory of static files as a My Page site via
 * `osaas-deploy-manager`'s `/mypages` API: create the site, mint presigned
 * upload targets in batches of at most `MAX_UPLOAD_FILES_PER_REQUEST`, POST
 * every file directly to its presigned target, then finalize the publish
 * with the complete file manifest and `prune: true`.
 */
export async function publishToMyPages(
  name: string,
  dir: string,
  ctx: Context
): Promise<MyPagesPublishResult> {
  const nameError = validateMyPageName(name);
  if (nameError) {
    throw new Error(nameError);
  }

  const relativePaths = listSiteFiles(dir);
  if (relativePaths.length === 0) {
    throw new Error(`No files found to publish in '${dir}'`);
  }
  if (relativePaths.length > MAX_PAGE_MANIFEST_FILES) {
    throw new Error(
      `'${dir}' contains ${relativePaths.length} files, which exceeds the ${MAX_PAGE_MANIFEST_FILES}-file limit for a single My Page site`
    );
  }

  const oversized = relativePaths.filter(
    (p) => statSync(join(dir, p)).size > MAX_PAGE_FILE_SIZE_BYTES
  );
  if (oversized.length > 0) {
    throw new Error(
      `The following files exceed the ${MAX_PAGE_FILE_SIZE_BYTES}-byte per-file limit: ${oversized.join(
        ', '
      )}`
    );
  }

  const page = await createMyPage(name, ctx);

  const fileBatches = chunk(relativePaths, MAX_UPLOAD_FILES_PER_REQUEST);
  const targetsByPath = new Map<string, MyPageUploadTarget>();
  for (const batch of fileBatches) {
    const files: MyPageUploadFile[] = batch.map((p) => ({
      path: p,
      size: statSync(join(dir, p)).size
    }));
    const { uploads } = await getPageUploadUrls(page.id, files, ctx);
    for (const upload of uploads) {
      targetsByPath.set(upload.path, upload);
    }
  }

  for (const relativePath of relativePaths) {
    const target = targetsByPath.get(relativePath);
    if (!target) {
      throw new Error(
        `Server did not return an upload target for '${relativePath}'`
      );
    }
    await uploadFileToPresignedTarget(join(dir, relativePath), target);
  }

  const published = await finalizeMyPagePublish(page.id, relativePaths, ctx);

  return { id: published.id, name: published.name, url: published.url };
}
