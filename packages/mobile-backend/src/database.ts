export class DatabaseError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown
  ) {
    super(`Database request failed: ${status} ${statusText}`);
    this.name = 'DatabaseError';
  }
}

export class DatabaseModule {
  readonly baseUrl: string;
  private getSat: () => string | undefined;

  constructor(baseUrl: string, getSat: () => string | undefined) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.getSat = getSat;
  }

  get fetch(): typeof globalThis.fetch {
    return (
      input: Parameters<typeof globalThis.fetch>[0],
      init?: RequestInit
    ) => {
      const headers = new Headers(init?.headers);
      const sat = this.getSat();
      if (sat) {
        headers.set('Authorization', `Bearer ${sat}`);
      }
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return globalThis.fetch(input, { ...init, headers });
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    const sat = this.getSat();
    if (sat) {
      headers['Authorization'] = `Bearer ${sat}`;
    }

    const response = await globalThis.fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const responseBody = await response.text().catch(() => '');
      let parsed: unknown;
      try {
        parsed = JSON.parse(responseBody);
      } catch {
        parsed = responseBody;
      }
      throw new DatabaseError(response.status, response.statusText, parsed);
    }

    if (response.status === 204 || method === 'DELETE') {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async get<T = unknown>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async patch<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  async delete(path: string): Promise<void> {
    await this.request<void>('DELETE', path);
  }
}
