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
  errorFactory: ErrorFactory = defaultErrorFactory
): Promise<T> => {
  try {
    Log().debug(`${options?.method}: ${url}`);
    const response = await fetch(url, { ...options });

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
    throw new FetchError({ message: getErrorMessage(error), cause: error });
  }
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
};

export class FetchError extends Error {
  httpCode?: number;

  constructor({
    message,
    httpCode,
    cause
  }: {
    message: string;
    httpCode?: number;
    cause?: unknown;
  }) {
    super(message, cause === undefined ? undefined : { cause });
    this.httpCode = httpCode;
  }
}
