import { Context } from './context';
import { createFetch, FetchError } from './fetch';
import { clearSuspensionRecord } from './suspension';

jest.mock('./fetch', () => ({
  ...jest.requireActual('./fetch'),
  createFetch: jest.fn()
}));

describe('clearSuspensionRecord', () => {
  const ctx = new Context({
    personalAccessToken: 'dummy',
    environment: 'dev'
  });
  const mockFetch = createFetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sends DELETE with PAT and no Content-Type on success', async () => {
    mockFetch.mockResolvedValueOnce({ message: 'deleted' });
    await expect(
      clearSuspensionRecord(ctx, 'svc-id', 'myname')
    ).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url.toString()).toEqual(
      'https://deploy.svc.dev.osaas.io/mysuspended/svc-id/myname'
    );
    expect(options.method).toEqual('DELETE');
    expect(options.headers['x-pat-jwt']).toEqual('Bearer dummy');
    expect(options.headers['Content-Type']).toBeUndefined();
  });

  test('treats 404 as a no-op', async () => {
    mockFetch.mockRejectedValueOnce(
      new FetchError({ message: 'not found', httpCode: 404 })
    );
    await expect(
      clearSuspensionRecord(ctx, 'svc-id', 'myname')
    ).resolves.toBeUndefined();
  });

  test('swallows a 500 error', async () => {
    mockFetch.mockRejectedValueOnce(
      new FetchError({ message: 'boom', httpCode: 500 })
    );
    await expect(
      clearSuspensionRecord(ctx, 'svc-id', 'myname')
    ).resolves.toBeUndefined();
  });

  test('swallows a network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));
    await expect(
      clearSuspensionRecord(ctx, 'svc-id', 'myname')
    ).resolves.toBeUndefined();
  });
});
