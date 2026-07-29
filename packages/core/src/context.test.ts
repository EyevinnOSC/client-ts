import { Context, PRIMARY_ENV, PROD_SITE_ENVS } from './context';

describe('Context environment / platformEnv split', () => {
  test('defaults environment to prod when not provided', () => {
    const ctx = new Context({ personalAccessToken: 'dummy' });
    expect(ctx.getEnvironment()).toBe('prod');
    expect(ctx.getPlatformEnvironment()).toBe('prod');
  });

  test('platformEnv defaults to PRIMARY_ENV when environment is prod-se', () => {
    const ctx = new Context({
      personalAccessToken: 'dummy',
      environment: 'prod-se'
    });
    expect(ctx.getEnvironment()).toBe('prod-se');
    expect(ctx.getPlatformEnvironment()).toBe(PRIMARY_ENV);
    expect(ctx.getPlatformEnvironment()).toBe('prod');
  });

  test('platformEnv defaults to prod when environment is prod', () => {
    const ctx = new Context({
      personalAccessToken: 'dummy',
      environment: 'prod'
    });
    expect(ctx.getEnvironment()).toBe('prod');
    expect(ctx.getPlatformEnvironment()).toBe('prod');
  });

  test('platformEnv stays on dev when environment is dev (independent environment, no site split)', () => {
    const ctx = new Context({
      personalAccessToken: 'dummy',
      environment: 'dev'
    });
    expect(ctx.getEnvironment()).toBe('dev');
    expect(ctx.getPlatformEnvironment()).toBe('dev');
  });

  test('platformEnv stays on stage when environment is stage (independent environment, no site split)', () => {
    const ctx = new Context({
      personalAccessToken: 'dummy',
      environment: 'stage'
    });
    expect(ctx.getEnvironment()).toBe('stage');
    expect(ctx.getPlatformEnvironment()).toBe('stage');
  });

  test('an explicit platformEnv override always wins, even for prod-se', () => {
    const ctx = new Context({
      personalAccessToken: 'dummy',
      environment: 'prod-se',
      platformEnv: 'custom-control-plane'
    });
    expect(ctx.getEnvironment()).toBe('prod-se');
    expect(ctx.getPlatformEnvironment()).toBe('custom-control-plane');
  });

  test('an explicit platformEnv override works for dev too', () => {
    const ctx = new Context({
      personalAccessToken: 'dummy',
      environment: 'dev',
      platformEnv: 'custom-control-plane'
    });
    expect(ctx.getEnvironment()).toBe('dev');
    expect(ctx.getPlatformEnvironment()).toBe('custom-control-plane');
  });

  test('PROD_SITE_ENVS contains exactly prod and prod-se', () => {
    expect(PROD_SITE_ENVS).toEqual(['prod', 'prod-se']);
  });
});
