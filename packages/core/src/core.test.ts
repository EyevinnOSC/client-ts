import { Context } from './context';
import {
  createInstance,
  isValidInstanceName,
  removeInstance,
  saveSecret
} from './core';
import { InvalidName } from './errors';
import { createFetch, FetchError } from './fetch';

jest.mock('./fetch', () => ({
  ...jest.requireActual('./fetch'),
  createFetch: jest.fn()
}));

describe('Core functionalities', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  test('validate instance name', () => {
    expect(isValidInstanceName('myinstance')).toEqual(true);
    expect(isValidInstanceName('my-instance')).toEqual(false);
  });

  test('an instance with an invalid name cannot be created', async () => {
    await expect(
      createInstance(
        new Context({ personalAccessToken: 'dummy' }),
        'eyevinn-test-adserver',
        'my-token',
        {
          name: 'my-instance'
        }
      )
    ).rejects.toThrow(new InvalidName('my-instance'));
    expect(createFetch).not.toHaveBeenCalled();
  });

  test('an instance with an valid name can be created', async () => {
    await expect(
      createInstance(
        new Context({ personalAccessToken: 'dummy' }),
        'eyevinn-test-adserver',
        'my-token',
        {
          name: 'myinstance'
        }
      )
    ).rejects.not.toThrow(new InvalidName('myinstance'));
    expect(createFetch).toHaveBeenCalled();
  });
});

describe('removeInstance', () => {
  const mockCreateFetch = createFetch as jest.MockedFunction<
    typeof createFetch
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const ctx = new Context({ personalAccessToken: 'dummy' });

  test("returns 'success' when the DELETE call resolves", async () => {
    // First call: getService (catalog subscription list)
    mockCreateFetch.mockResolvedValueOnce([
      { serviceId: 'eyevinn-test-adserver', apiUrl: 'https://api.example.com' }
    ]);
    // Second call: the DELETE itself
    mockCreateFetch.mockResolvedValueOnce(undefined);

    const result = await removeInstance(
      ctx,
      'eyevinn-test-adserver',
      'myinstance',
      'my-token'
    );
    expect(result).toBe('success');
  });

  test("returns 'alreadyAbsent' when the DELETE responds with 404", async () => {
    // First call: getService
    mockCreateFetch.mockResolvedValueOnce([
      { serviceId: 'eyevinn-test-adserver', apiUrl: 'https://api.example.com' }
    ]);
    // Second call: DELETE throws FetchError 404
    mockCreateFetch.mockRejectedValueOnce(
      new FetchError({ message: 'Not Found', httpCode: 404 })
    );

    const result = await removeInstance(
      ctx,
      'eyevinn-test-adserver',
      'myinstance',
      'my-token'
    );
    expect(result).toBe('alreadyAbsent');
  });

  test('rethrows non-404 FetchErrors', async () => {
    // First call: getService
    mockCreateFetch.mockResolvedValueOnce([
      { serviceId: 'eyevinn-test-adserver', apiUrl: 'https://api.example.com' }
    ]);
    // Second call: DELETE throws FetchError 500
    mockCreateFetch.mockRejectedValueOnce(
      new FetchError({ message: 'Internal Server Error', httpCode: 500 })
    );

    await expect(
      removeInstance(ctx, 'eyevinn-test-adserver', 'myinstance', 'my-token')
    ).rejects.toThrow(FetchError);
  });
});

describe('site-scoped calls (deploy-manager) still use environment, not platformEnv', () => {
  const mockCreateFetch = createFetch as jest.MockedFunction<
    typeof createFetch
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('saveSecret targets deploy.svc.<environment>, not platformEnv, even when they diverge on prod-se', async () => {
    const ctx = new Context({
      personalAccessToken: 'dummy',
      environment: 'prod-se'
    });
    // platformEnv should have collapsed to 'prod' for this context, while
    // environment (site) stays 'prod-se' — saveSecret must follow the site.
    expect(ctx.getPlatformEnvironment()).toBe('prod');
    expect(ctx.getEnvironment()).toBe('prod-se');

    mockCreateFetch.mockResolvedValueOnce(undefined);

    await saveSecret('eyevinn-test-adserver', 'my-secret', 'value', ctx);

    expect(mockCreateFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockCreateFetch.mock.calls[0][0] as URL;
    expect(calledUrl.hostname).toBe('deploy.svc.prod-se.osaas.io');
  });
});
