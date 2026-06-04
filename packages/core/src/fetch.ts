import { Log } from './log';

type CommonErrorReponse =
  | any
  | {
      message?: string;
      reason?: string;
    };

export type ErrorFactory = (response: Response) => Promise<FetchError>;

const defaultErrorFactory: ErrorFactory = async (response) => {
  if (response.headers.get('content-type')?.includes('application/json')) {
    const res: CommonErrorReponse = await response.json();
    return new FetchError({
      message: res?.message ?? res?.reason ?? JSON.stringify(res),
      httpCode: response.status
    });
  } else {
    const res = await response.text();
    return new FetchError({
      message: res,
      httpCode: response.status
    });
  }
};

export const createFetch = async <T>(
  url: string | URL,
  options?: RequestInit,
  errorFactory: ErrorFactory = defaultErrorFactory,
  tlsRejectUnauthorized = true
): Promise<T> => {
  try {
    Log().debug(`${options?.method}: ${url}`);
    const fetchOptions: RequestInit = { ...options };
    if (!tlsRejectUnauthorized) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Agent } = require('undici') as {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Agent: new (opts: { connect: { rejectUnauthorized: boolean } }) => any;
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fetchOptions as any).dispatcher = new Agent({
        connect: { rejectUnauthorized: false }
      });
    }
    const response = await fetch(url, fetchOptions);

    Log().debug(
      response.status + ': ' + response.statusText + ': ' + response.ok
    );
    if (!response.ok) {
      throw await errorFactory(response);
    }

    if (response.headers.get('content-type')?.includes('application/json')) {
      const res = await response.json();
      return res as T;
    } else {
      const res = await response.text();
      return res as T;
    }
  } catch (error: unknown) {
    if (error instanceof FetchError) {
      Log().debug(error.httpCode + ': ' + error.message);
      throw error;
    }
    throw new FetchError({ message: getErrorMessage(error) });
  }
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
};

export class FetchError extends Error {
  httpCode?: number;

  constructor({ message, httpCode }: { message: string; httpCode?: number }) {
    super(message);
    this.httpCode = httpCode;
  }
}
