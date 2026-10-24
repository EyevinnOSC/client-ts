import { FetchError, createFetch } from './fetch';

const fetchMockResponseJsonOk = () =>
  Promise.resolve({
    ok: true,
    status: 200,
    headers: {
      get: () => 'application/json'
    },
    json: async () => ({ data: 'test' })
  } as unknown as Response);

const fetchMockResponseTextOk = () =>
  Promise.resolve({
    ok: true,
    status: 200,
    headers: {
      get: () => 'text/plain'
    },
    text: async () => 'test'
  } as unknown as Response);

const fetchMockResponseTextError = () =>
  Promise.resolve({
    ok: false,
    status: 400,
    headers: {
      get: () => 'text/plain'
    },
    text: async () => 'unexpected error'
  } as unknown as Response);

describe('fetch', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('can handle json response', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(fetchMockResponseJsonOk);

    const data = await createFetch<{ data: string }>('https://mock.com/test');
    expect(data).toEqual({ data: 'test' });
  });

  test('can handle non-json response', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(fetchMockResponseTextOk);

    const data = await createFetch<string>('https://mock.com/test');
    expect(data).toEqual('test');
  });

  test('can handle error response', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(fetchMockResponseTextError);

    let caught: unknown;
    await expect(
      createFetch<string>('https://mock.com/test').catch((e) => {
        caught = e;
        throw e;
      })
    ).rejects.toMatchObject({ message: 'unexpected error', httpCode: 400 });
    expect(caught).toBeInstanceOf(FetchError);
    expect(Object.prototype.hasOwnProperty.call(caught, 'cause')).toBe(false);
  });

  test('keeps the original error as cause', async () => {
    const original = new TypeError('fetch failed', {
      cause: { code: 'ECONNRESET' }
    });
    jest.spyOn(global, 'fetch').mockRejectedValue(original);

    const result = createFetch<string>('https://mock.com/test');
    await expect(result).rejects.toBeInstanceOf(FetchError);
    await expect(result).rejects.toMatchObject({
      message: 'fetch failed',
      httpCode: undefined,
      cause: original
    });
    await expect(result).rejects.toHaveProperty(
      'cause.cause.code',
      'ECONNRESET'
    );
    await expect(result).rejects.toHaveProperty('cause', original);
  });

  test('keeps a non-Error rejection as cause', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue('boom');

    const result = createFetch<string>('https://mock.com/test');
    await expect(result).rejects.toMatchObject({
      message: JSON.stringify('boom'),
      cause: 'boom'
    });
  });
});
