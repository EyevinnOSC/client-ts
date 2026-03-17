import { DatabaseModule, DatabaseError } from '../database';
import { MobileBackendClient } from '../index';

function mockResponse(status: number, body: unknown, ok?: boolean): Response {
  const bodyStr = body !== undefined ? JSON.stringify(body) : '';
  return {
    ok: ok !== undefined ? ok : status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : status === 204 ? 'No Content' : 'Error',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(bodyStr)
  } as unknown as Response;
}

describe('DatabaseModule', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('GET request', () => {
    it('sends GET with correct headers', async () => {
      const data = [{ id: 1, name: 'Alice' }];
      fetchSpy.mockResolvedValueOnce(mockResponse(200, data));

      const db = new DatabaseModule('https://db.example.com', () => 'my-sat');
      const result = await db.get('/users');

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://db.example.com/users',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer my-sat',
            'Content-Type': 'application/json',
            Accept: 'application/json'
          })
        })
      );
      expect(result).toEqual(data);
    });

    it('strips trailing slash from baseUrl', async () => {
      fetchSpy.mockResolvedValueOnce(mockResponse(200, []));

      const db = new DatabaseModule('https://db.example.com/', () => undefined);
      await db.get('/users');

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://db.example.com/users');
    });
  });

  describe('POST request', () => {
    it('sends POST with JSON body', async () => {
      const payload = { name: 'Bob' };
      const created = { id: 2, name: 'Bob' };
      fetchSpy.mockResolvedValueOnce(mockResponse(200, created));

      const db = new DatabaseModule(
        'https://db.example.com',
        () => 'sat-token'
      );
      const result = await db.post('/users', payload);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://db.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload)
        })
      );
      expect(result).toEqual(created);
    });
  });

  describe('PATCH request', () => {
    it('sends PATCH with JSON body', async () => {
      const payload = { name: 'Charlie' };
      const updated = { id: 1, name: 'Charlie' };
      fetchSpy.mockResolvedValueOnce(mockResponse(200, updated));

      const db = new DatabaseModule(
        'https://db.example.com',
        () => 'sat-token'
      );
      const result = await db.patch('/users?id=eq.1', payload);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://db.example.com/users?id=eq.1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(payload)
        })
      );
      expect(result).toEqual(updated);
    });
  });

  describe('DELETE request', () => {
    it('returns void on DELETE', async () => {
      fetchSpy.mockResolvedValueOnce(mockResponse(204, undefined));

      const db = new DatabaseModule(
        'https://db.example.com',
        () => 'sat-token'
      );
      const result = await db.delete('/users?id=eq.1');

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://db.example.com/users?id=eq.1',
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result).toBeUndefined();
    });
  });

  describe('SAT authorization', () => {
    it('attaches Authorization header when SAT is set', async () => {
      fetchSpy.mockResolvedValueOnce(mockResponse(200, []));

      const db = new DatabaseModule('https://db.example.com', () => 'test-sat');
      await db.get('/items');

      const [, init] = fetchSpy.mock.calls[0];
      expect((init.headers as Record<string, string>)['Authorization']).toBe(
        'Bearer test-sat'
      );
    });

    it('omits Authorization header when SAT is undefined', async () => {
      fetchSpy.mockResolvedValueOnce(mockResponse(200, []));

      const db = new DatabaseModule('https://db.example.com', () => undefined);
      await db.get('/items');

      const [, init] = fetchSpy.mock.calls[0];
      expect(
        (init.headers as Record<string, string>)['Authorization']
      ).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('throws DatabaseError on non-2xx response with JSON body', async () => {
      const errorBody = { message: 'Not found' };
      fetchSpy.mockResolvedValue(mockResponse(404, errorBody, false));

      const db = new DatabaseModule('https://db.example.com', () => undefined);

      const err = await db.get('/missing').catch((e) => e);
      expect(err).toBeInstanceOf(DatabaseError);
      const dbErr = err as DatabaseError;
      expect(dbErr.status).toBe(404);
      expect(dbErr.statusText).toBe('Error');
      expect(dbErr.body).toEqual(errorBody);
    });

    it('throws DatabaseError with raw text body when JSON parse fails', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('not json')),
        text: () => Promise.resolve('Server error')
      } as unknown as Response);

      const db = new DatabaseModule('https://db.example.com', () => undefined);
      const err = await db.get('/boom').catch((e) => e);

      expect(err).toBeInstanceOf(DatabaseError);
      const dbErr = err as DatabaseError;
      expect(dbErr.status).toBe(500);
      expect(dbErr.body).toBe('Server error');
    });
  });

  describe('fetch getter', () => {
    it('returns a wrapped fetch that adds Authorization and content headers', async () => {
      fetchSpy.mockResolvedValueOnce(mockResponse(200, {}));

      const db = new DatabaseModule(
        'https://db.example.com',
        () => 'wrapped-sat'
      );
      await db.fetch('https://db.example.com/test', { method: 'GET' });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [, init] = fetchSpy.mock.calls[0];
      const headers = init.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer wrapped-sat');
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Accept')).toBe('application/json');
    });

    it('fetch getter omits Authorization when SAT is undefined', async () => {
      fetchSpy.mockResolvedValueOnce(mockResponse(200, {}));

      const db = new DatabaseModule('https://db.example.com', () => undefined);
      await db.fetch('https://db.example.com/test', { method: 'GET' });

      const [, init] = fetchSpy.mock.calls[0];
      const headers = init.headers as Headers;
      expect(headers.get('Authorization')).toBeNull();
    });
  });
});

describe('MobileBackendClient.db', () => {
  it('throws when database config is not provided', () => {
    const client = new MobileBackendClient({ sat: 'tok' });
    expect(() => client.db).toThrow(
      'database configuration is required to use the database module'
    );
  });

  it('returns a DatabaseModule when database config is provided', () => {
    const client = new MobileBackendClient({
      sat: 'tok',
      database: { url: 'https://db.example.com' }
    });
    expect(client.db).toBeInstanceOf(DatabaseModule);
  });

  it('returns the same DatabaseModule instance on repeated access', () => {
    const client = new MobileBackendClient({
      database: { url: 'https://db.example.com' }
    });
    const first = client.db;
    const second = client.db;
    expect(first).toBe(second);
  });

  it('db module uses the client SAT', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockResponse(200, []));

    const client = new MobileBackendClient({
      sat: 'client-sat',
      database: { url: 'https://db.example.com' }
    });

    await client.db.get('/rows');

    const [, init] = fetchSpy.mock.calls[0] as [
      unknown,
      { headers: Record<string, string> }
    ];
    expect(init.headers['Authorization']).toBe('Bearer client-sat');

    fetchSpy.mockRestore();
  });
});
