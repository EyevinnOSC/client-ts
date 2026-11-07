import { Context } from './context';
import {
  buildRedisUrl,
  createInstance,
  createValkeyPasswordSecret
} from './core';
import { PasswordRequired } from './errors';
import { createFetch } from './fetch';

jest.mock('./fetch', () => ({
  ...jest.requireActual('./fetch'),
  createFetch: jest.fn()
}));

const mockCreateFetch = createFetch as jest.MockedFunction<typeof createFetch>;

describe('createInstance valkey-io-valkey password requirement', () => {
  const ctx = new Context({ personalAccessToken: 'dummy' });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateFetch.mockResolvedValueOnce([
      { serviceId: 'valkey-io-valkey', apiUrl: 'https://api.example.com' },
      { serviceId: 'eyevinn-test-adserver', apiUrl: 'https://api.example.com' }
    ]);
    mockCreateFetch.mockResolvedValueOnce({ name: 'myvalkey' });
  });

  test.each([[undefined], [''], ['   ']])(
    'refuses a create with Password %p before any request',
    async (password) => {
      await expect(
        createInstance(ctx, 'valkey-io-valkey', 'token', {
          name: 'myvalkey',
          Password: password
        })
      ).rejects.toThrow(PasswordRequired);
      expect(mockCreateFetch).not.toHaveBeenCalled();
    }
  );

  test('allows a supplied Password', async () => {
    await createInstance(ctx, 'valkey-io-valkey', 'token', {
      name: 'myvalkey',
      Password: 'secret'
    });
    expect(mockCreateFetch).toHaveBeenCalledTimes(2);
  });

  test('allows a {{secrets.x}} reference', async () => {
    await createInstance(ctx, 'valkey-io-valkey', 'token', {
      name: 'myvalkey',
      Password: '{{secrets.myvalkey}}'
    });
    expect(mockCreateFetch).toHaveBeenCalledTimes(2);
  });

  test('does not affect other service ids', async () => {
    await createInstance(ctx, 'eyevinn-test-adserver', 'token', {
      name: 'myvalkey'
    });
    expect(mockCreateFetch).toHaveBeenCalledTimes(2);
  });
});

describe('createValkeyPasswordSecret', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateFetch.mockResolvedValue(undefined);
  });

  test('stores a generated password as a secret and returns a reference', async () => {
    const ctx = new Context({ personalAccessToken: 'dummy' });
    const result = await createValkeyPasswordSecret(ctx, 'myvalkey');
    expect(result.secretName).toBe('myvalkey');
    expect(result.secretRef).toBe('{{secrets.myvalkey}}');
    expect(Buffer.from(result.password, 'base64')).toHaveLength(32);
    const [url, init] = mockCreateFetch.mock.calls[0];
    expect((url as URL).pathname).toBe('/mysecrets/valkey-io-valkey');
    expect(JSON.parse((init as any).body)).toEqual({
      secretName: 'myvalkey',
      secretData: result.password
    });
  });

  test('generates a different password each time', async () => {
    const ctx = new Context({ personalAccessToken: 'dummy' });
    const a = await createValkeyPasswordSecret(ctx, 'myvalkey');
    const b = await createValkeyPasswordSecret(ctx, 'myvalkey');
    expect(a.password).not.toEqual(b.password);
  });

  test('buildRedisUrl URL-encodes the password', () => {
    expect(buildRedisUrl('1.2.3.4', 6379, 'a+b/c=')).toBe(
      'redis://:a%2Bb%2Fc%3D@1.2.3.4:6379'
    );
  });
});
