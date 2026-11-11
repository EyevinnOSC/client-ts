import { Context } from './context';
import { createFetch } from './fetch';
import { getInstanceEvents } from './instance-events';

jest.mock('./fetch', () => ({
  ...jest.requireActual('./fetch'),
  createFetch: jest.fn()
}));

describe('getInstanceEvents', () => {
  const ctx = new Context({ personalAccessToken: 'dummy', environment: 'dev' });
  const mockFetch = createFetch as jest.Mock;
  const response = {
    events: [],
    retentionDays: 90,
    capturedSince: '2026-11-01T00:00:00.000Z',
    truncated: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue(response);
  });

  test('sends GET with the PAT and no query parameters by default', async () => {
    const res = await getInstanceEvents(ctx, 'svc-id', 'myname');
    expect(res).toEqual(response);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url.toString()).toEqual(
      'https://deploy.svc.dev.osaas.io/myinstances/svc-id/myname/events'
    );
    expect(options.method).toEqual('GET');
    expect(options.headers['x-pat-jwt']).toEqual('Bearer dummy');
  });

  test('sends cursor unchanged when given', async () => {
    await getInstanceEvents(ctx, 'svc-id', 'myname', { cursor: 'abc' });
    const url: URL = mockFetch.mock.calls[0][0];
    expect(url.searchParams.get('cursor')).toEqual('abc');
  });

  test('sends from, to, limit and a comma-separated type', async () => {
    await getInstanceEvents(ctx, 'svc-id', 'myname', {
      from: '2026-11-01T00:00:00Z',
      to: '2026-11-02T00:00:00Z',
      type: ['crash', 'oom'],
      limit: 10
    });
    const url: URL = mockFetch.mock.calls[0][0];
    expect(url.searchParams.get('from')).toEqual('2026-11-01T00:00:00Z');
    expect(url.searchParams.get('to')).toEqual('2026-11-02T00:00:00Z');
    expect(url.searchParams.get('type')).toEqual('crash,oom');
    expect(url.searchParams.get('limit')).toEqual('10');
    expect(url.searchParams.has('cursor')).toBe(false);
  });

  test('encodes the path segments', async () => {
    await getInstanceEvents(ctx, 'svc-id', 'my name');
    const url: URL = mockFetch.mock.calls[0][0];
    expect(url.pathname).toEqual('/myinstances/svc-id/my%20name/events');
  });
});
