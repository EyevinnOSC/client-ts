import { Command } from 'commander';
import { cmdWeb } from './cmd';

jest.mock('@osaas/client-web', () => ({
  publishToMyPages: jest.fn(),
  createCloudfrontDistribution: jest.fn()
}));

jest.mock('@osaas/client-core', () => ({
  Context: jest.fn().mockImplementation(() => ({})),
  createInstance: jest.fn(),
  getInstance: jest.fn(),
  getPortsForInstance: jest.fn(),
  removeInstance: jest.fn(),
  waitForInstanceReady: jest.fn()
}));

import { publishToMyPages } from '@osaas/client-web';

const mockPublishToMyPages = publishToMyPages as jest.Mock;

describe('web publish command', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  function applyExitOverrideRecursively(cmd: Command): void {
    cmd.exitOverride();
    cmd.commands.forEach(applyExitOverrideRecursively);
  }

  function createTestCli(): Command {
    const cli = new Command();
    cli
      .configureHelp({ showGlobalOptions: true })
      .option('--env <environment>', 'Environment to use', 'prod');
    cli.addCommand(cmdWeb());
    applyExitOverrideRecursively(cli);
    return cli;
  }

  test('publish has no --backend option', () => {
    const cli = createTestCli();
    const publishCommand = cli.commands
      .find((c) => c.name() === 'web')
      ?.commands.find((c) => c.name() === 'publish');

    expect(publishCommand).toBeDefined();
    const backendOption = publishCommand?.options.find((opt) =>
      opt.flags.includes('--backend')
    );
    expect(backendOption).toBeUndefined();
  });

  test('publish always calls publishToMyPages, unconditionally', async () => {
    mockPublishToMyPages.mockResolvedValue({
      id: 'mysite',
      name: 'mysite',
      url: 'https://mysite.pages.dev.osaas.io/'
    });

    const cli = createTestCli();
    await cli.parseAsync([
      'node',
      'test',
      'web',
      'publish',
      'mysite',
      './dist'
    ]);

    expect(mockPublishToMyPages).toHaveBeenCalledTimes(1);
    expect(mockPublishToMyPages).toHaveBeenCalledWith(
      'mysite',
      './dist',
      expect.anything()
    );
  });

  test('rejects an unknown --backend flag since the option no longer exists', () => {
    const cli = createTestCli();

    expect(() =>
      cli.parse([
        'node',
        'test',
        'web',
        'publish',
        'mysite',
        './dist',
        '--backend',
        'mypages'
      ])
    ).toThrow();
  });

  test('prints the custom-domain/CDN regression note on success', async () => {
    mockPublishToMyPages.mockResolvedValue({
      id: 'mysite',
      name: 'mysite',
      url: 'https://mysite.pages.dev.osaas.io/'
    });

    const cli = createTestCli();
    await cli.parseAsync([
      'node',
      'test',
      'web',
      'publish',
      'mysite',
      './dist'
    ]);

    const loggedMessages = logSpy.mock.calls.map((call) => call[0]);
    expect(
      loggedMessages.some((msg) =>
        String(msg).includes('mysite.pages.dev.osaas.io')
      )
    ).toBe(true);
    expect(
      loggedMessages.some((msg) =>
        String(msg).includes('osaas-deploy-manager#1409')
      )
    ).toBe(true);
  });

  test('reports the error message when publishToMyPages rejects', async () => {
    mockPublishToMyPages.mockRejectedValue(
      new Error('No files found to publish')
    );

    const cli = createTestCli();
    await cli.parseAsync([
      'node',
      'test',
      'web',
      'publish',
      'mysite',
      './dist'
    ]);

    expect(logSpy).toHaveBeenCalledWith('No files found to publish');
  });
});
