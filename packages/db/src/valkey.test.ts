import { Context, getPortsForInstance } from '@osaas/client-core';
import {
  createValkeyIoValkeyInstance,
  getValkeyIoValkeyInstance
} from '@osaas/client-services';
import { setupDatabase } from '.';
import { ValkeyDb } from './valkey';

jest.mock('@osaas/client-core', () => ({
  getInternalEndpoint: jest.fn(),
  getPortsForInstance: jest.fn(),
  Log: () => ({ error: jest.fn() }),
  buildRedisUrl: jest.fn(
    (host: string, port: number, pw: string) =>
      `redis://:${encodeURIComponent(pw)}@${host}:${port}`
  ),
  createValkeyPasswordSecret: jest.fn().mockResolvedValue({
    password: 'pw+/=',
    secretName: 'myvalkey',
    secretRef: '{{secrets.myvalkey}}'
  }),
  Context: jest.fn().mockImplementation(() => ({
    getServiceAccessToken: jest.fn().mockResolvedValue('token')
  }))
}));

jest.mock('@osaas/client-services', () => ({
  getValkeyIoValkeyInstance: jest.fn(),
  createValkeyIoValkeyInstance: jest.fn().mockResolvedValue({}),
  removeValkeyIoValkeyInstance: jest.fn()
}));

const mockGetPorts = getPortsForInstance as jest.Mock;

describe('valkey password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPorts.mockResolvedValue([
      { internalPort: 6379, externalIp: '1.2.3.4', externalPort: 1234 }
    ]);
  });

  it('setupDatabase requires a password for valkey', async () => {
    (getValkeyIoValkeyInstance as jest.Mock).mockResolvedValue(undefined);
    await expect(
      setupDatabase(new Context(), 'valkey', 'myvalkey', {})
    ).rejects.toThrow('Password is required for valkey');
    expect(createValkeyIoValkeyInstance).not.toHaveBeenCalled();
  });

  it('setupDatabase passes a supplied password on create', async () => {
    (getValkeyIoValkeyInstance as jest.Mock).mockResolvedValue(undefined);
    await setupDatabase(new Context(), 'valkey', 'myvalkey', {
      password: 'secret'
    }).catch(() => undefined);
    expect(createValkeyIoValkeyInstance).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: 'myvalkey', Password: 'secret' })
    );
  });

  it('ValkeyDb generates a password secret on create and returns a URL with it', async () => {
    (getValkeyIoValkeyInstance as jest.Mock).mockResolvedValue(undefined);
    const db = new ValkeyDb({ context: new Context(), name: 'myvalkey' });
    const url = await db.getRedisUrl();
    expect(createValkeyIoValkeyInstance).toHaveBeenCalledWith(
      expect.anything(),
      { name: 'myvalkey', Password: '{{secrets.myvalkey}}' }
    );
    expect(url?.password).toBe(encodeURIComponent('pw+/='));
    expect(url?.hostname).toBe('1.2.3.4');
  });

  it('ValkeyDb does not generate for an existing instance', async () => {
    (getValkeyIoValkeyInstance as jest.Mock).mockResolvedValue({
      name: 'myvalkey'
    });
    const db = new ValkeyDb({ context: new Context(), name: 'myvalkey' });
    const url = await db.getRedisUrl();
    expect(createValkeyIoValkeyInstance).not.toHaveBeenCalled();
    expect(url?.password).toBe('');
  });
});
