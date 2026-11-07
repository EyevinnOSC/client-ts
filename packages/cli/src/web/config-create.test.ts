import { Command } from 'commander';
import { cmdWeb } from './cmd';

jest.mock('@osaas/client-web', () => ({
  publishToMyPages: jest.fn(),
  createCloudfrontDistribution: jest.fn()
}));

jest.mock('@osaas/client-core', () => ({
  Context: jest.fn().mockImplementation(() => ({
    getServiceAccessToken: jest.fn().mockResolvedValue('sat')
  })),
  clearSuspensionRecord: jest.fn().mockResolvedValue(undefined),
  createInstance: jest.fn(),
  createValkeyPasswordSecret: jest.fn().mockResolvedValue({
    password: 'pw+/=',
    secretName: 'myconfig',
    secretRef: '{{secrets.myconfig}}'
  }),
  buildRedisUrl: jest.fn(
    (host: string, port: number, pw: string) =>
      `redis://:${encodeURIComponent(pw)}@${host}:${port}`
  ),
  saveSecret: jest.fn().mockResolvedValue(undefined),
  getInstance: jest.fn(),
  getPortsForInstance: jest.fn(),
  removeInstance: jest.fn(),
  waitForInstanceReady: jest.fn()
}));

import {
  clearSuspensionRecord,
  createInstance,
  getInstance,
  getPortsForInstance,
  saveSecret
} from '@osaas/client-core';

const mockSaveSecret = saveSecret as jest.Mock;

const mockClear = clearSuspensionRecord as jest.Mock;
const mockCreate = createInstance as jest.Mock;
const mockGetInstance = getInstance as jest.Mock;
const mockGetPorts = getPortsForInstance as jest.Mock;

describe('web config-create command', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  function createTestCli(): Command {
    const cli = new Command();
    cli.option('--env <environment>', 'Environment to use', 'prod');
    cli.addCommand(cmdWeb());
    return cli;
  }

  test('clears suspension records after each successful create', async () => {
    mockGetInstance.mockResolvedValue(undefined);
    mockGetPorts.mockResolvedValue([
      { internalPort: 6379, externalIp: '1.2.3.4', externalPort: 1234 }
    ]);
    mockCreate.mockImplementation(async (_ctx, serviceId, _token, body) => ({
      name: body.name,
      url: `https://${serviceId}.example`
    }));

    await createTestCli().parseAsync([
      'node',
      'test',
      'web',
      'config-create',
      'myconfig'
    ]);

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockClear).toHaveBeenCalledTimes(2);
    expect(mockClear).toHaveBeenCalledWith(
      expect.anything(),
      'valkey-io-valkey',
      'myconfig'
    );
    expect(mockClear).toHaveBeenCalledWith(
      expect.anything(),
      'eyevinn-app-config-svc',
      'myconfig'
    );
  });

  test('creates the Valkey with a generated password secret and wires the whole URL as a secret', async () => {
    mockGetInstance.mockResolvedValue(undefined);
    mockGetPorts.mockResolvedValue([
      { internalPort: 6379, externalIp: '1.2.3.4', externalPort: 1234 }
    ]);
    mockCreate.mockImplementation(async (_ctx, serviceId, _token, body) => ({
      name: body.name,
      url: `https://${serviceId}.example`
    }));

    await createTestCli().parseAsync([
      'node',
      'test',
      'web',
      'config-create',
      'myconfig'
    ]);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.anything(),
      'valkey-io-valkey',
      'sat',
      { name: 'myconfig', Password: '{{secrets.myconfig}}' }
    );
    expect(mockSaveSecret).toHaveBeenCalledWith(
      'eyevinn-app-config-svc',
      'redisurlmyconfig',
      'redis://:pw%2B%2F%3D@1.2.3.4:1234',
      expect.anything()
    );
    expect(mockCreate).toHaveBeenCalledWith(
      expect.anything(),
      'eyevinn-app-config-svc',
      'sat',
      { name: 'myconfig', RedisUrl: '{{secrets.redisurlmyconfig}}' }
    );
    const printed = logSpy.mock.calls.flat().join('\n');
    expect(printed).toContain('redisurlmyconfig');
    expect(printed).not.toContain('pw+/=');
    expect(printed).not.toContain('pw%2B');
  });

  test('does not clear when the instance already exists', async () => {
    mockGetInstance.mockResolvedValue({
      name: 'myconfig',
      url: 'https://existing.example'
    });

    await createTestCli().parseAsync([
      'node',
      'test',
      'web',
      'config-create',
      'myconfig'
    ]);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockClear).not.toHaveBeenCalled();
  });

  test('does not clear when createInstance fails', async () => {
    mockGetInstance.mockResolvedValue(undefined);
    mockCreate.mockRejectedValue(new Error('create failed'));

    await createTestCli().parseAsync([
      'node',
      'test',
      'web',
      'config-create',
      'myconfig'
    ]);

    expect(mockClear).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('create failed');
  });
});
