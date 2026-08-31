import { Context } from '@osaas/client-core';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

jest.mock('form-data');
// eslint-disable-next-line @typescript-eslint/no-var-requires
import FormData from 'form-data';

import {
  createMyPage,
  finalizeMyPagePublish,
  getPageUploadUrls,
  MAX_UPLOAD_FILES_PER_REQUEST,
  MyPageUploadTarget,
  publishToMyPages,
  uploadFileToPresignedTarget,
  validateMyPageName
} from './mypage';

const MockFormData = FormData as unknown as jest.Mock;

/**
 * `FormData.append('file', createReadStream(path), ...)` opens a real fs
 * read stream that the mocked `submit()` below never pipes/drains. In real
 * `form-data`, `submit()` pipes (and thereby subscribes to 'error' on) every
 * appended stream immediately. Our mock does not, so Node's own `ReadStream`
 * can still emit an `error` event asynchronously (e.g. `ENOENT` once the
 * test's temp directory is removed in `afterEach`, racing the underlying
 * `fs.open()`) with zero listeners attached, which Node treats as an
 * unhandled exception and crashes the whole test run. Attaching a no-op
 * `error` listener (and destroying the stream, since nothing else will)
 * mirrors what `form-data` does for us in production.
 */
function destroyingAppend(onCall?: (args: unknown[]) => void): jest.Mock {
  return jest.fn((...args: unknown[]) => {
    onCall?.(args);
    if (args[0] === 'file') {
      const stream = args[1] as NodeJS.EventEmitter & {
        destroy?: () => void;
      };
      stream?.on?.('error', () => undefined);
      stream?.destroy?.();
    }
  });
}

type FakeUploadResponse = NodeJS.ReadableStream & { statusCode: number };

function fakeUploadResponse(
  statusCode: number,
  body = ''
): {
  res: FakeUploadResponse;
  emit: (event: string, ...args: unknown[]) => void;
} {
  const handlers: Record<string, Array<(...args: unknown[]) => void>> = {};
  const res = {
    statusCode,
    on(event: string, cb: (...args: unknown[]) => void) {
      handlers[event] = handlers[event] || [];
      handlers[event].push(cb);
      return res;
    }
  } as unknown as FakeUploadResponse;
  const emit = (event: string, ...args: unknown[]) => {
    (handlers[event] || []).forEach((cb) => cb(...args));
  };
  // Default: emit the body as a single 'data' chunk before 'end' is fired
  // manually by the caller once handlers are guaranteed to be registered.
  if (body) {
    (res as unknown as { __body: string }).__body = body;
  }
  return { res, emit };
}

function jsonResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {}
): Promise<Response> {
  const normalizedHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    normalizedHeaders[k.toLowerCase()] = v;
  }
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (h: string) => {
        const key = h.toLowerCase();
        if (key === 'content-type') return 'application/json';
        return normalizedHeaders[key];
      }
    },
    json: async () => body
  } as unknown as Response);
}

describe('mypage', () => {
  const ctx = new Context({
    personalAccessToken: 'dummy-pat',
    environment: 'dev'
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('validateMyPageName', () => {
    test('accepts a valid name', () => {
      expect(validateMyPageName('my-site-1')).toBeUndefined();
    });

    test('rejects a name that is too short', () => {
      expect(validateMyPageName('ab')).toMatch(/between 3 and 52/);
    });

    test('rejects uppercase characters', () => {
      expect(validateMyPageName('MySite')).toMatch(/lowercase/);
    });

    test('rejects a name starting with a hyphen', () => {
      expect(validateMyPageName('-mysite')).toMatch(/lowercase/);
    });
  });

  describe('createMyPage', () => {
    test('returns the created page on success', async () => {
      jest.spyOn(global, 'fetch').mockImplementation(() =>
        jsonResponse(201, {
          id: 'mysite',
          name: 'mysite',
          url: 'https://mysite.pages.dev.osaas.io/',
          status: 'draft'
        })
      );

      const page = await createMyPage('mysite', ctx);
      expect(page.id).toEqual('mysite');
      expect(page.status).toEqual('draft');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('throws immediately on 409 without retrying', async () => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockImplementation(() =>
          jsonResponse(409, { reason: "Page name 'mysite' is already in use" })
        );

      await expect(createMyPage('mysite', ctx)).rejects.toThrow(
        /already in use/
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    test('retries on 503 with Retry-After and eventually succeeds', async () => {
      jest.useFakeTimers();
      let call = 0;
      jest.spyOn(global, 'fetch').mockImplementation(() => {
        call += 1;
        if (call === 1) {
          return jsonResponse(
            503,
            { reason: 'still starting up' },
            { 'retry-after': '5' }
          );
        }
        return jsonResponse(201, {
          id: 'mysite',
          name: 'mysite',
          url: 'https://mysite.pages.dev.osaas.io/',
          status: 'draft'
        });
      });

      const promise = createMyPage('mysite', ctx);
      // Let the first fetch + rejection resolve, then advance past the
      // 5s Retry-After backoff.
      await jest.advanceTimersByTimeAsync(5000);
      const page = await promise;

      expect(page.id).toEqual('mysite');
      expect(global.fetch).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });

    test('gives up after exceeding the ~60s retry budget', async () => {
      jest.useFakeTimers();
      jest
        .spyOn(global, 'fetch')
        .mockImplementation(() =>
          jsonResponse(
            503,
            { reason: 'still starting up' },
            { 'retry-after': '20' }
          )
        );

      const promise = createMyPage('mysite', ctx);
      const assertion = expect(promise).rejects.toThrow(
        /still starting up after/
      );
      await jest.advanceTimersByTimeAsync(20000);
      await jest.advanceTimersByTimeAsync(20000);
      await jest.advanceTimersByTimeAsync(20000);
      await jest.advanceTimersByTimeAsync(20000);
      await assertion;
      jest.useRealTimers();
    });
  });

  describe('getPageUploadUrls', () => {
    test('returns the upload targets from the server', async () => {
      const uploads = [
        {
          path: 'index.html',
          url: 'https://tenant-tenantmypages.minio-minio.auto.dev.osaas.io/mysite',
          method: 'POST',
          contentType: 'text/html',
          fields: { bucket: 'mysite', key: 'index.html' }
        }
      ];
      jest.spyOn(global, 'fetch').mockImplementation(() =>
        jsonResponse(200, {
          uploads,
          expiresAt: new Date().toISOString(),
          maxFileSizeBytes: 26214400
        })
      );

      const result = await getPageUploadUrls(
        'mysite',
        [{ path: 'index.html', size: 10 }],
        ctx
      );
      expect(result.uploads).toEqual(uploads);
    });

    test('propagates a 404 when the page does not exist', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockImplementation(() =>
          jsonResponse(404, { reason: "My Page 'mysite' not found" })
        );

      await expect(
        getPageUploadUrls('mysite', [{ path: 'index.html', size: 10 }], ctx)
      ).rejects.toThrow(/not found/);
    });
  });

  describe('finalizeMyPagePublish', () => {
    test('returns the live page on success', async () => {
      jest.spyOn(global, 'fetch').mockImplementation(() =>
        jsonResponse(200, {
          id: 'mysite',
          name: 'mysite',
          url: 'https://mysite.pages.dev.osaas.io/',
          status: 'live',
          prunedCount: 2
        })
      );

      const result = await finalizeMyPagePublish('mysite', ['index.html'], ctx);
      expect(result.status).toEqual('live');
      expect(result.prunedCount).toEqual(2);
    });
  });

  describe('uploadFileToPresignedTarget', () => {
    const target: MyPageUploadTarget = {
      path: 'index.html',
      url: 'https://tenant-tenantmypages.minio-minio.auto.dev.osaas.io/mysite',
      method: 'POST',
      contentType: 'text/html',
      fields: {
        bucket: 'mysite',
        key: 'index.html',
        'Content-Type': 'text/html',
        'x-amz-date': '20260101T000000Z',
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-credential': 'root/...',
        policy: 'base64policy',
        'x-amz-signature': 'signature'
      }
    };

    let dir: string;
    let filePath: string;

    beforeEach(() => {
      dir = mkdtempSync(join(tmpdir(), 'mypage-upload-'));
      filePath = join(dir, 'index.html');
      writeFileSync(filePath, '<html></html>');
    });

    afterEach(() => {
      rmSync(dir, { recursive: true, force: true });
    });

    test('appends all fields in order with the file last, then resolves on 2xx', async () => {
      const appendCalls: unknown[][] = [];
      const mockAppend = destroyingAppend((args) => appendCalls.push(args));
      const mockSubmit = jest.fn(
        (
          _url: string,
          cb: (err: Error | null, res?: FakeUploadResponse) => void
        ) => {
          const { res, emit } = fakeUploadResponse(200);
          cb(null, res);
          emit('data', Buffer.from(''));
          emit('end');
        }
      );
      MockFormData.mockImplementation(() => ({
        append: mockAppend,
        submit: mockSubmit
      }));

      await uploadFileToPresignedTarget(filePath, target);

      expect(mockSubmit).toHaveBeenCalledWith(target.url, expect.any(Function));
      const fieldNames = appendCalls.map((call) => call[0]);
      expect(fieldNames).toEqual([
        'bucket',
        'key',
        'Content-Type',
        'x-amz-date',
        'x-amz-algorithm',
        'x-amz-credential',
        'policy',
        'x-amz-signature',
        'file'
      ]);
    });

    test('rejects with the failing path and status when the server returns an error', async () => {
      const mockSubmit = jest.fn(
        (
          _url: string,
          cb: (err: Error | null, res?: FakeUploadResponse) => void
        ) => {
          const { res, emit } = fakeUploadResponse(403);
          cb(null, res);
          emit('data', Buffer.from('AccessDenied'));
          emit('end');
        }
      );
      MockFormData.mockImplementation(() => ({
        append: destroyingAppend(),
        submit: mockSubmit
      }));

      await expect(
        uploadFileToPresignedTarget(filePath, target)
      ).rejects.toThrow(/index\.html.*403/);
    });

    test('rejects when the underlying request errors', async () => {
      const mockSubmit = jest.fn(
        (_url: string, cb: (err: Error | null) => void) => {
          cb(new Error('socket hang up'));
        }
      );
      MockFormData.mockImplementation(() => ({
        append: destroyingAppend(),
        submit: mockSubmit
      }));

      await expect(
        uploadFileToPresignedTarget(filePath, target)
      ).rejects.toThrow(/socket hang up/);
    });
  });

  describe('publishToMyPages', () => {
    let dir: string;

    afterEach(() => {
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    });

    function mockSuccessfulUploads() {
      const mockSubmit = jest.fn(
        (
          _url: string,
          cb: (err: Error | null, res?: FakeUploadResponse) => void
        ) => {
          const { res, emit } = fakeUploadResponse(200);
          cb(null, res);
          emit('data', Buffer.from(''));
          emit('end');
        }
      );
      MockFormData.mockImplementation(() => ({
        append: destroyingAppend(),
        submit: mockSubmit
      }));
      return mockSubmit;
    }

    function targetsFor(files: { path: string }[]): MyPageUploadTarget[] {
      return files.map((f) => ({
        path: f.path,
        url: `https://tenant-tenantmypages.minio-minio.auto.dev.osaas.io/mysite`,
        method: 'POST',
        contentType: 'text/html',
        fields: { bucket: 'mysite', key: f.path }
      }));
    }

    test('creates the page, uploads every file, then publishes with prune:true', async () => {
      dir = mkdtempSync(join(tmpdir(), 'mypage-publish-'));
      writeFileSync(join(dir, 'index.html'), '<html></html>');
      writeFileSync(join(dir, 'app.css'), 'body{}');

      mockSuccessfulUploads();

      const fetchCalls: { url: string; body: string }[] = [];
      jest.spyOn(global, 'fetch').mockImplementation((url, init) => {
        const urlStr = url.toString();
        fetchCalls.push({
          url: urlStr,
          body: (init?.body as string) || ''
        });
        if (urlStr.endsWith('/mypages')) {
          return jsonResponse(201, {
            id: 'mysite',
            name: 'mysite',
            url: 'https://mysite.pages.dev.osaas.io/',
            status: 'draft'
          });
        }
        if (urlStr.includes('/upload-urls')) {
          const body = JSON.parse((init?.body as string) || '{}');
          return jsonResponse(200, {
            uploads: targetsFor(body.files),
            expiresAt: new Date().toISOString(),
            maxFileSizeBytes: 26214400
          });
        }
        if (urlStr.includes('/publish')) {
          return jsonResponse(200, {
            id: 'mysite',
            name: 'mysite',
            url: 'https://mysite.pages.dev.osaas.io/',
            status: 'live',
            prunedCount: 0
          });
        }
        throw new Error(`Unexpected fetch to ${urlStr}`);
      });

      const result = await publishToMyPages('mysite', dir, ctx);

      expect(result.url).toEqual('https://mysite.pages.dev.osaas.io/');
      const publishCall = fetchCalls.find((c) => c.url.includes('/publish'));
      expect(publishCall).toBeDefined();
      const publishBody = JSON.parse((publishCall as { body: string }).body);
      expect(publishBody.prune).toEqual(true);
      expect(publishBody.files.sort()).toEqual(['app.css', 'index.html']);
    });

    test('surfaces which file failed and does not call publish', async () => {
      dir = mkdtempSync(join(tmpdir(), 'mypage-publish-fail-'));
      writeFileSync(join(dir, 'index.html'), '<html></html>');
      writeFileSync(join(dir, 'broken.css'), 'body{}');

      let submitCall = 0;
      const mockSubmit = jest.fn(
        (
          _url: string,
          cb: (err: Error | null, res?: FakeUploadResponse) => void
        ) => {
          submitCall += 1;
          const status = submitCall === 1 ? 200 : 500;
          const { res, emit } = fakeUploadResponse(status);
          cb(null, res);
          emit('data', Buffer.from(status === 500 ? 'server error' : ''));
          emit('end');
        }
      );
      MockFormData.mockImplementation(() => ({
        append: destroyingAppend(),
        submit: mockSubmit
      }));

      let publishCalled = false;
      jest.spyOn(global, 'fetch').mockImplementation((url, init) => {
        const urlStr = url.toString();
        if (urlStr.endsWith('/mypages')) {
          return jsonResponse(201, {
            id: 'mysite',
            name: 'mysite',
            url: 'https://mysite.pages.dev.osaas.io/',
            status: 'draft'
          });
        }
        if (urlStr.includes('/upload-urls')) {
          const body = JSON.parse((init?.body as string) || '{}');
          return jsonResponse(200, {
            uploads: targetsFor(body.files),
            expiresAt: new Date().toISOString(),
            maxFileSizeBytes: 26214400
          });
        }
        if (urlStr.includes('/publish')) {
          publishCalled = true;
          return jsonResponse(200, {
            id: 'mysite',
            name: 'mysite',
            url: 'https://mysite.pages.dev.osaas.io/',
            status: 'live'
          });
        }
        throw new Error(`Unexpected fetch to ${urlStr}`);
      });

      await expect(publishToMyPages('mysite', dir, ctx)).rejects.toThrow(
        /failed with HTTP 500/
      );
      expect(publishCalled).toEqual(false);
    });

    test('chunks upload-urls requests when there are more than 500 files', async () => {
      dir = mkdtempSync(join(tmpdir(), 'mypage-publish-chunk-'));
      const fileCount = MAX_UPLOAD_FILES_PER_REQUEST + 1;
      for (let i = 0; i < fileCount; i++) {
        writeFileSync(join(dir, `file-${i}.txt`), 'x');
      }

      mockSuccessfulUploads();

      let uploadUrlsCalls = 0;
      jest.spyOn(global, 'fetch').mockImplementation((url, init) => {
        const urlStr = url.toString();
        if (urlStr.endsWith('/mypages')) {
          return jsonResponse(201, {
            id: 'mysite',
            name: 'mysite',
            url: 'https://mysite.pages.dev.osaas.io/',
            status: 'draft'
          });
        }
        if (urlStr.includes('/upload-urls')) {
          uploadUrlsCalls += 1;
          const body = JSON.parse((init?.body as string) || '{}');
          expect(body.files.length).toBeLessThanOrEqual(
            MAX_UPLOAD_FILES_PER_REQUEST
          );
          return jsonResponse(200, {
            uploads: targetsFor(body.files),
            expiresAt: new Date().toISOString(),
            maxFileSizeBytes: 26214400
          });
        }
        if (urlStr.includes('/publish')) {
          return jsonResponse(200, {
            id: 'mysite',
            name: 'mysite',
            url: 'https://mysite.pages.dev.osaas.io/',
            status: 'live'
          });
        }
        throw new Error(`Unexpected fetch to ${urlStr}`);
      });

      await publishToMyPages('mysite', dir, ctx);

      expect(uploadUrlsCalls).toEqual(2);
    }, 30000);

    test('rejects an empty directory before creating a page', async () => {
      dir = mkdtempSync(join(tmpdir(), 'mypage-publish-empty-'));
      const fetchMock = jest.spyOn(global, 'fetch');

      await expect(publishToMyPages('mysite', dir, ctx)).rejects.toThrow(
        /No files found/
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('rejects an invalid page name before creating a page', async () => {
      dir = mkdtempSync(join(tmpdir(), 'mypage-publish-badname-'));
      writeFileSync(join(dir, 'index.html'), '<html></html>');
      const fetchMock = jest.spyOn(global, 'fetch');

      await expect(publishToMyPages('My_Site', dir, ctx)).rejects.toThrow(
        /lowercase/
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
