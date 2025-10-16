import { Command } from 'commander';

describe('CLI environment option', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createTestCli = () => {
    const cli = new Command();
    cli
      .configureHelp({ showGlobalOptions: true })
      .option('--env <environment>', 'Environment to use (overrides ENVIRONMENT env var)', process.env.ENVIRONMENT || 'prod');
    return cli;
  };

  test('defaults to prod when no ENVIRONMENT env var is set', () => {
    delete process.env.ENVIRONMENT;
    const cli = createTestCli();
    cli.parse(['node', 'cli.js']);
    
    expect(cli.opts().env).toBe('prod');
  });

  test('uses ENVIRONMENT env var when set', () => {
    process.env.ENVIRONMENT = 'dev';
    const cli = createTestCli();
    cli.parse(['node', 'cli.js']);
    
    expect(cli.opts().env).toBe('dev');
  });

  test('--env flag overrides ENVIRONMENT env var', () => {
    process.env.ENVIRONMENT = 'dev';
    const cli = createTestCli();
    cli.parse(['node', 'cli.js', '--env', 'staging']);
    
    expect(cli.opts().env).toBe('staging');
  });

  test('--env flag works when no ENVIRONMENT env var is set', () => {
    delete process.env.ENVIRONMENT;
    const cli = createTestCli();
    cli.parse(['node', 'cli.js', '--env', 'staging']);
    
    expect(cli.opts().env).toBe('staging');
  });
});