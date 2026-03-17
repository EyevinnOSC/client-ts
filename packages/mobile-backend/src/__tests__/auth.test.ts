import { AuthModule, AuthTokens } from '../auth';
import { MobileBackendClient } from '../index';

const mockAuthorize = jest.fn();
const mockExchange = jest.fn();
const mockVerify = jest.fn();
const mockRefresh = jest.fn();

jest.mock('@openauthjs/openauth/client', () => ({
  createClient: jest.fn(() => ({
    authorize: mockAuthorize,
    exchange: mockExchange,
    verify: mockVerify,
    refresh: mockRefresh
  }))
}));

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString(
    'base64url'
  );
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('AuthModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authorize()', () => {
    it('returns url and challenge from openauth client', async () => {
      const expected = {
        url: 'https://auth.example.com/authorize?state=abc',
        challenge: { state: 'abc', verifier: 'verifier-xyz' }
      };
      mockAuthorize.mockResolvedValueOnce(expected);

      const mod = new AuthModule('https://auth.example.com', 'my-client');
      const result = await mod.authorize('https://app.example.com/callback', {
        pkce: true
      });

      expect(mockAuthorize).toHaveBeenCalledWith(
        'https://app.example.com/callback',
        'code',
        { pkce: true }
      );
      expect(result).toEqual(expected);
    });

    it('passes provider option when supplied', async () => {
      mockAuthorize.mockResolvedValueOnce({
        url: 'https://auth.example.com/authorize',
        challenge: { state: 'x' }
      });

      const mod = new AuthModule('https://auth.example.com', 'my-client');
      await mod.authorize('https://app.example.com/callback', {
        provider: 'email'
      });

      expect(mockAuthorize).toHaveBeenCalledWith(
        'https://app.example.com/callback',
        'code',
        { provider: 'email' }
      );
    });
  });

  describe('exchange()', () => {
    it('stores tokens on success and returns them', async () => {
      const tokens: AuthTokens = {
        access: makeJwt({ sub: 'user-123' }),
        refresh: 'refresh-tok'
      };
      mockExchange.mockResolvedValueOnce({ err: false, tokens });

      const mod = new AuthModule('https://auth.example.com', 'my-client');
      const result = await mod.exchange(
        'code-abc',
        'https://app.example.com/callback'
      );

      expect(result).toEqual({ err: false, tokens });
      expect(mod.getAuthHeader()).toBe(`Bearer ${tokens.access}`);
    });

    it('passes verifier for PKCE flow', async () => {
      const tokens: AuthTokens = {
        access: makeJwt({ sub: 'user-123' }),
        refresh: 'refresh-tok'
      };
      mockExchange.mockResolvedValueOnce({ err: false, tokens });

      const mod = new AuthModule('https://auth.example.com', 'my-client');
      await mod.exchange(
        'code-abc',
        'https://app.example.com/callback',
        'my-verifier'
      );

      expect(mockExchange).toHaveBeenCalledWith(
        'code-abc',
        'https://app.example.com/callback',
        'my-verifier'
      );
    });

    it('does not store tokens on error and returns error result', async () => {
      const errorResult = { err: new Error('InvalidAuthorizationCode') };
      mockExchange.mockResolvedValueOnce(errorResult);

      const mod = new AuthModule('https://auth.example.com', 'my-client');
      const result = await mod.exchange(
        'bad-code',
        'https://app.example.com/callback'
      );

      expect(result).toEqual(errorResult);
      expect(mod.getAuthHeader()).toBeUndefined();
    });
  });

  describe('setTokens()', () => {
    it('stores tokens so getAuthHeader returns Bearer value', () => {
      const mod = new AuthModule('https://auth.example.com', 'my-client');
      mod.setTokens({ access: 'access-tok', refresh: 'refresh-tok' });

      expect(mod.getAuthHeader()).toBe('Bearer access-tok');
    });
  });

  describe('verify()', () => {
    it('delegates to openauth client verify', async () => {
      const verifyResult = {
        subject: { type: 'user', properties: { id: '1' } }
      };
      mockVerify.mockResolvedValueOnce(verifyResult);

      const mod = new AuthModule('https://auth.example.com', 'my-client');
      const subjects = {};
      const result = await mod.verify(subjects, 'some-access-token', {
        refresh: 'some-refresh-token'
      });

      expect(mockVerify).toHaveBeenCalledWith(subjects, 'some-access-token', {
        refresh: 'some-refresh-token'
      });
      expect(result).toEqual(verifyResult);
    });
  });

  describe('refresh()', () => {
    it('delegates to openauth client refresh', async () => {
      const refreshResult = {
        err: false,
        tokens: {
          access: 'new-access',
          refresh: 'new-refresh',
          expiresIn: 3600
        }
      };
      mockRefresh.mockResolvedValueOnce(refreshResult);

      const mod = new AuthModule('https://auth.example.com', 'my-client');
      const result = await mod.refresh('old-refresh-token', {
        access: 'old-access-token'
      });

      expect(mockRefresh).toHaveBeenCalledWith('old-refresh-token', {
        access: 'old-access-token'
      });
      expect(result).toEqual(refreshResult);
    });
  });

  describe('getUserId()', () => {
    it('decodes sub claim from stored JWT access token', async () => {
      const jwt = makeJwt({ sub: 'user-123', iat: 1700000000 });
      mockExchange.mockResolvedValueOnce({
        err: false,
        tokens: { access: jwt, refresh: 'refresh-tok' }
      });

      const mod = new AuthModule('https://auth.example.com', 'my-client');
      await mod.exchange('code', 'https://app.example.com/callback');

      expect(mod.getUserId()).toBe('user-123');
    });

    it('returns undefined when no tokens are stored', () => {
      const mod = new AuthModule('https://auth.example.com', 'my-client');
      expect(mod.getUserId()).toBeUndefined();
    });

    it('returns undefined for a malformed token', () => {
      const mod = new AuthModule('https://auth.example.com', 'my-client');
      mod.setTokens({ access: 'not.a.valid.jwt.here.extra', refresh: '' });
      // still 3 parts after split? 'not.a.valid' has 3 — but payload won't have sub
      mod.setTokens({ access: 'onlyone', refresh: '' });
      expect(mod.getUserId()).toBeUndefined();
    });
  });

  describe('getAuthHeader()', () => {
    it('returns undefined when no tokens stored', () => {
      const mod = new AuthModule('https://auth.example.com', 'my-client');
      expect(mod.getAuthHeader()).toBeUndefined();
    });

    it('returns Bearer header after tokens are set', () => {
      const mod = new AuthModule('https://auth.example.com', 'my-client');
      mod.setTokens({ access: 'my-access-token', refresh: 'my-refresh' });
      expect(mod.getAuthHeader()).toBe('Bearer my-access-token');
    });
  });
});

describe('MobileBackendClient.auth', () => {
  it('throws when auth config is not provided', () => {
    const client = new MobileBackendClient({ sat: 'test-sat' });
    expect(() => client.auth).toThrow(
      'auth configuration is required to use the auth module'
    );
  });

  it('returns an AuthModule instance when auth config is provided', () => {
    const client = new MobileBackendClient({
      auth: { issuer: 'https://auth.example.com', clientID: 'my-app' }
    });
    expect(client.auth).toBeInstanceOf(AuthModule);
  });

  it('returns the same AuthModule instance on repeated access', () => {
    const client = new MobileBackendClient({
      auth: { issuer: 'https://auth.example.com', clientID: 'my-app' }
    });
    const first = client.auth;
    const second = client.auth;
    expect(first).toBe(second);
  });
});
