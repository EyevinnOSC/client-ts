import { Command } from 'commander';
import { cmdCreate } from './cmd';

jest.mock('@osaas/client-core', () => ({
  Context: jest.fn().mockImplementation(() => ({
    getServiceAccessToken: jest.fn().mockResolvedValue('sat')
  })),
  clearSuspensionRecord: jest.fn().mockResolvedValue(undefined),
  createInstance: jest.fn(),
  createValkeyPasswordSecret: jest.fn().mockResolvedValue({
    password: 'topsecretvalue',
    secretName: 'myvalkey',
    secretRef: '{{secrets.myvalkey}}'
  })
}));

import { createInstance, createValkeyPasswordSecret } from '@osaas/client-core';

const mockCreate = createInstance as jest.Mock;
const mockGenerate = createValkeyPasswordSecret as jest.Mock;

describe('create command', () => {
  let logSpy: jest.SpyInstance;
  let errSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({ name: 'myvalkey' });
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  async function run(...args: string[]) {
    const cli = new Command();
    cli.option('--env <environment>', 'Environment to use', 'prod');
    cli.addCommand(cmdCreate());
    await cli.parseAsync(['node', 'test', 'create', ...args]);
  }

  test('generates a password secret for valkey-io-valkey without Password', async () => {
    await run('valkey-io-valkey', 'myvalkey');
    expect(mockGenerate).toHaveBeenCalledWith(expect.anything(), 'myvalkey');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.anything(),
      'valkey-io-valkey',
      'sat',
      { name: 'myvalkey', Password: '{{secrets.myvalkey}}' }
    );
    const printed = [...logSpy.mock.calls, ...errSpy.mock.calls]
      .flat()
      .join('\n');
    expect(printed).toContain("secret 'myvalkey'");
    expect(printed).not.toContain('topsecretvalue');
  });

  test('passes a supplied Password through', async () => {
    await run('valkey-io-valkey', 'myvalkey', '-o', 'Password=mine');
    expect(mockGenerate).not.toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.anything(),
      'valkey-io-valkey',
      'sat',
      { name: 'myvalkey', Password: 'mine' }
    );
  });

  test('passes a {{secrets.x}} reference through', async () => {
    await run('valkey-io-valkey', 'myvalkey', '-o', 'Password={{secrets.x}}');
    expect(mockGenerate).not.toHaveBeenCalled();
    expect(mockCreate.mock.calls[0][3].Password).toBe('{{secrets.x}}');
  });

  test('does not touch other service ids', async () => {
    await run('eyevinn-test-adserver', 'myinstance');
    expect(mockGenerate).not.toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.anything(),
      'eyevinn-test-adserver',
      'sat',
      { name: 'myinstance' }
    );
  });
});
