import { Context } from './context';
import { createFetch, FetchError } from './fetch';
import {
  accessTokenErrorFactory,
  createAccessToken,
  deleteAccessToken,
  getAccessToken,
  iterateAuditEvents,
  listAccessTokens,
  listAuditEvents,
  replaceAccessTokenPolicy,
  simulateAccessToken,
  updateAccessToken
} from './accesstoken';

jest.mock('./fetch', () => ({
  ...jest.requireActual('./fetch'),
  createFetch: jest.fn()
}));

const mockFetch = createFetch as jest.Mock;
const policy = {
  version: 1 as const,
  statements: [{ actions: ['myapps:read'], resources: ['myapps/*'] }]
};

describe.each([
  ['dev', 'https://token.svc.dev.osaas.io'],
  ['prod-se', 'https://token.svc.prod.osaas.io']
])('access token SDK against %s', (environment, base) => {
  const ctx = new Context({
    personalAccessToken: 'fake-pat',
    environment
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ items: [] });
  });

  const call = (n = 0) => {
    const [url, options, factory] = mockFetch.mock.calls[n];
    return { url: (url as URL).toString(), options, factory };
  };

  test('listAccessTokens sends GET with limit and after', async () => {
    await listAccessTokens(ctx, { limit: 10, after: 'abc' });
    const { url, options, factory } = call();
    expect(url).toEqual(`${base}/tokens?limit=10&after=abc`);
    expect(options.method).toEqual('GET');
    expect(options.headers['x-pat-jwt']).toEqual('Bearer fake-pat');
    expect(factory).toBe(accessTokenErrorFactory);
  });

  test('listAccessTokens without options sends no query', async () => {
    await listAccessTokens(ctx);
    expect(call().url).toEqual(`${base}/tokens`);
  });

  test('getAccessToken sends GET and encodes the id', async () => {
    await getAccessToken(ctx, 'a/b');
    const { url, options } = call();
    expect(url).toEqual(`${base}/tokens/a%2Fb`);
    expect(options.method).toEqual('GET');
    expect(options.headers['x-pat-jwt']).toEqual('Bearer fake-pat');
  });

  test('createAccessToken sends POST with the body', async () => {
    const body = { name: 'n', template: 'viewer', expiresInSeconds: 86400 };
    await createAccessToken(ctx, body);
    const { url, options } = call();
    expect(url).toEqual(`${base}/tokens`);
    expect(options.method).toEqual('POST');
    expect(options.headers['x-pat-jwt']).toEqual('Bearer fake-pat');
    expect(options.headers['Content-Type']).toEqual('application/json');
    expect(JSON.parse(options.body)).toEqual(body);
  });

  test('replaceAccessTokenPolicy sends PUT with policy and expectedVersion', async () => {
    await replaceAccessTokenPolicy(ctx, 'id1', policy, 3);
    const { url, options } = call();
    expect(url).toEqual(`${base}/tokens/id1/policy`);
    expect(options.method).toEqual('PUT');
    expect(options.headers['x-pat-jwt']).toEqual('Bearer fake-pat');
    expect(JSON.parse(options.body)).toEqual({ policy, expectedVersion: 3 });
  });

  test('updateAccessToken sends PATCH with the patch', async () => {
    await updateAccessToken(ctx, 'id1', { status: 'disabled' });
    const { url, options } = call();
    expect(url).toEqual(`${base}/tokens/id1`);
    expect(options.method).toEqual('PATCH');
    expect(options.headers['x-pat-jwt']).toEqual('Bearer fake-pat');
    expect(JSON.parse(options.body)).toEqual({ status: 'disabled' });
  });

  test('deleteAccessToken sends DELETE without Content-Type', async () => {
    mockFetch.mockResolvedValueOnce('');
    await expect(deleteAccessToken(ctx, 'id1')).resolves.toBeUndefined();
    const { url, options } = call();
    expect(url).toEqual(`${base}/tokens/id1`);
    expect(options.method).toEqual('DELETE');
    expect(options.headers['x-pat-jwt']).toEqual('Bearer fake-pat');
    expect(options.headers['Content-Type']).toBeUndefined();
    expect(options.body).toBeUndefined();
  });

  test('simulateAccessToken sends POST with action and resource', async () => {
    mockFetch.mockResolvedValueOnce({ allowed: true });
    const res = await simulateAccessToken(
      ctx,
      'id1',
      'myapps:read',
      'myapps/web'
    );
    expect(res).toEqual({ allowed: true });
    const { url, options } = call();
    expect(url).toEqual(`${base}/tokens/id1/simulate`);
    expect(options.method).toEqual('POST');
    expect(options.headers['x-pat-jwt']).toEqual('Bearer fake-pat');
    expect(JSON.parse(options.body)).toEqual({
      action: 'myapps:read',
      resource: 'myapps/web'
    });
  });

  test('listAuditEvents sends the filter and no export parameter by default', async () => {
    await listAuditEvents(ctx, {
      patId: 'p1',
      kind: 'authz.deny',
      decision: 'deny',
      from: '2026-11-01T00:00:00.000Z',
      to: '2026-11-02T00:00:00.000Z',
      limit: 50
    });
    const { url, options } = call();
    const u = new URL(url);
    expect(u.origin + u.pathname).toEqual(`${base}/audit/events`);
    expect(options.method).toEqual('GET');
    expect(options.headers['x-pat-jwt']).toEqual('Bearer fake-pat');
    expect(Object.fromEntries(u.searchParams)).toEqual({
      patId: 'p1',
      kind: 'authz.deny',
      decision: 'deny',
      from: '2026-11-01T00:00:00.000Z',
      to: '2026-11-02T00:00:00.000Z',
      limit: '50'
    });
  });

  test('listAuditEvents omits undefined filter values and passes the cursor', async () => {
    await listAuditEvents(ctx, { userId: undefined, kind: 'x' }, 'cur+/=');
    const u = new URL(call().url);
    expect(u.searchParams.has('userId')).toBe(false);
    expect(u.searchParams.get('cursor')).toEqual('cur+/=');
  });

  test('iterateAuditEvents with export sends export=true on every page and passes cursors unchanged', async () => {
    mockFetch
      .mockResolvedValueOnce({ items: [{ eventId: 'a' }], next: 'c1' })
      .mockResolvedValueOnce({ items: [{ eventId: 'b' }], next: 'c2' })
      .mockResolvedValueOnce({ items: [{ eventId: 'c' }] });
    const pages = [];
    for await (const page of iterateAuditEvents(
      ctx,
      { kind: 'authz.deny' },
      { export: true }
    )) {
      pages.push(page);
    }
    expect(pages).toHaveLength(3);
    expect(mockFetch).toHaveBeenCalledTimes(3);
    const params = [0, 1, 2].map((n) => new URL(call(n).url).searchParams);
    expect(params.map((p) => p.get('export'))).toEqual([
      'true',
      'true',
      'true'
    ]);
    expect(params.map((p) => p.get('cursor'))).toEqual([null, 'c1', 'c2']);
    expect(params.map((p) => p.get('kind'))).toEqual([
      'authz.deny',
      'authz.deny',
      'authz.deny'
    ]);
  });

  test('iterateAuditEvents without export sends no export parameter', async () => {
    mockFetch
      .mockResolvedValueOnce({ items: [], next: 'c1' })
      .mockResolvedValueOnce({ items: [] });
    for await (const page of iterateAuditEvents(ctx, {})) {
      void page;
    }
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(new URL(call(0).url).searchParams.has('export')).toBe(false);
    expect(new URL(call(1).url).searchParams.has('export')).toBe(false);
    expect(new URL(call(1).url).searchParams.get('cursor')).toEqual('c1');
  });
});

describe('accessTokenErrorFactory', () => {
  const jsonResponse = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' }
    });

  test('keeps reason and code of a 403 in the message', async () => {
    const err = await accessTokenErrorFactory(
      jsonResponse(403, {
        reason: 'denied for you',
        code: 'insufficient_scope'
      })
    );
    expect(err).toBeInstanceOf(FetchError);
    expect(err.httpCode).toEqual(403);
    expect(err.message).toContain('denied for you');
    expect(err.message).toContain('insufficient_scope');
  });

  test('uses the reason alone when there is no code', async () => {
    const err = await accessTokenErrorFactory(
      jsonResponse(409, { reason: 'policy version mismatch' })
    );
    expect(err.httpCode).toEqual(409);
    expect(err.message).toEqual('policy version mismatch');
  });

  test('does not repeat a code that the reason already contains', async () => {
    const err = await accessTokenErrorFactory(
      jsonResponse(403, {
        reason: 'insufficient_scope',
        code: 'insufficient_scope'
      })
    );
    expect(err.message).toEqual('insufficient_scope');
  });

  test('uses the body text of a non-JSON error', async () => {
    const err = await accessTokenErrorFactory(
      new Response('Bad Gateway', {
        status: 502,
        headers: { 'content-type': 'text/plain' }
      })
    );
    expect(err.httpCode).toEqual(502);
    expect(err.message).toEqual('Bad Gateway');
  });
});
