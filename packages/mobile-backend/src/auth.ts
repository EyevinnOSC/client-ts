import { createClient } from '@openauthjs/openauth/client';
import type {
  AuthorizeResult,
  ExchangeSuccess,
  ExchangeError,
  RefreshSuccess,
  RefreshError,
  VerifyResult,
  VerifyError
} from '@openauthjs/openauth/client';

export type {
  AuthorizeResult,
  ExchangeSuccess,
  ExchangeError,
  RefreshSuccess,
  RefreshError,
  VerifyResult,
  VerifyError
};

export interface AuthTokens {
  access: string;
  refresh: string;
}

export class AuthModule {
  private openauth: ReturnType<typeof createClient>;
  private tokens?: AuthTokens;

  constructor(issuer: string, clientID: string) {
    this.openauth = createClient({ issuer, clientID });
  }

  async authorize(
    redirectUri: string,
    opts?: { pkce?: boolean; provider?: string }
  ): Promise<AuthorizeResult> {
    return this.openauth.authorize(redirectUri, 'code', opts);
  }

  async exchange(
    code: string,
    redirectUri: string,
    verifier?: string
  ): Promise<ExchangeSuccess | ExchangeError> {
    const result = await this.openauth.exchange(code, redirectUri, verifier);
    if (!result.err) {
      this.tokens = {
        access: result.tokens.access,
        refresh: result.tokens.refresh
      };
    }
    return result;
  }

  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async verify(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subjects: any,
    token: string,
    opts?: { refresh?: string }
  ): Promise<VerifyResult | VerifyError> {
    return this.openauth.verify(subjects, token, opts);
  }

  async refresh(
    refreshToken: string,
    opts?: { access?: string }
  ): Promise<RefreshSuccess | RefreshError> {
    return this.openauth.refresh(refreshToken, opts);
  }

  getUserId(): string | undefined {
    if (!this.tokens?.access) return undefined;
    try {
      const parts = this.tokens.access.split('.');
      if (parts.length !== 3) return undefined;
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );
      return payload.sub as string | undefined;
    } catch {
      return undefined;
    }
  }

  getAuthHeader(): string | undefined {
    if (!this.tokens?.access) return undefined;
    return `Bearer ${this.tokens.access}`;
  }
}
