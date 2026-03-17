declare module '@openauthjs/openauth/client' {
  export interface AuthorizeResult {
    url: string;
    challenge?: { state: string; verifier: string };
  }

  export interface OpenAuthTokens {
    access: string;
    refresh: string;
  }

  export interface ExchangeSuccess {
    err?: false;
    tokens: OpenAuthTokens;
  }

  export interface ExchangeError {
    err: { type: string };
    tokens?: never;
  }

  export interface RefreshSuccess {
    err?: false;
    tokens: OpenAuthTokens;
  }

  export interface RefreshError {
    err: { type: string };
    tokens?: never;
  }

  export interface VerifyResult {
    err?: false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subject: any;
    tokens?: OpenAuthTokens;
  }

  export interface VerifyError {
    err: { type: string };
  }

  interface OpenAuthClient {
    authorize(
      redirectUri: string,
      responseType: 'code' | 'token',
      opts?: { pkce?: boolean; provider?: string }
    ): Promise<AuthorizeResult>;
    exchange(
      code: string,
      redirectUri: string,
      verifier?: string
    ): Promise<ExchangeSuccess | ExchangeError>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verify(
      subjects: any,
      token: string,
      opts?: { refresh?: string }
    ): Promise<VerifyResult | VerifyError>;
    refresh(
      refreshToken: string,
      opts?: { access?: string }
    ): Promise<RefreshSuccess | RefreshError>;
  }

  export function createClient(opts: {
    issuer: string;
    clientID: string;
  }): OpenAuthClient;
}
