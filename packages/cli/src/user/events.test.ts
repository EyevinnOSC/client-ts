import { Command } from 'commander';
import { cmdEvents } from './cmd';

jest.mock('@osaas/client-core', () => ({
  Context: jest.fn().mockImplementation(() => ({})),
  getInstanceEvents: jest.fn()
}));

import { getInstanceEvents } from '@osaas/client-core';

const mockEvents = getInstanceEvents as jest.Mock;

const base = {
  events: [
    {
      id: 'a1',
      type: 'crash',
      actor: 'platform',
      trigger: 'kubelet',
      outcome: 'observed',
      reason: 'OOMKilled',
      count: 1,
      firstAt: '2026-11-10T10:00:00.000Z',
      lastAt: '2026-11-10T10:00:00.000Z'
    }
  ],
  retentionDays: 90,
  capturedSince: '2026-11-01T00:00:00.000Z',
  truncated: false
};

describe('events command', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockEvents.mockResolvedValue(base);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  async function run(...args: string[]) {
    const cli = new Command();
    cli.option('--env <environment>', 'Environment to use', 'prod');
    cli.addCommand(cmdEvents());
    await cli.parseAsync(['node', 'test', 'events', ...args]);
  }

  const printed = () => logSpy.mock.calls.flat().join('\n');
  const lastOptions = () => mockEvents.mock.calls[0][3];

  test('prints capturedSince and retentionDays, no notice when not truncated', async () => {
    await run('svc', 'name');
    expect(mockEvents).toHaveBeenCalledWith(
      expect.anything(),
      'svc',
      'name',
      expect.anything()
    );
    expect(printed()).toContain('captured since 2026-11-01T00:00:00.000Z');
    expect(printed()).toContain('retention 90 days');
    expect(printed()).toContain('crash');
    expect(printed()).not.toContain('truncated');
    expect(printed()).not.toContain('--cursor');
  });

  test('prints a notice with oldestRetainedAt when truncated', async () => {
    mockEvents.mockResolvedValue({
      ...base,
      truncated: true,
      oldestRetainedAt: '2026-11-05T00:00:00.000Z'
    });
    await run('svc', 'name');
    expect(printed()).toContain('truncated');
    expect(printed()).toContain('2026-11-05T00:00:00.000Z');
  });

  test('prints the next cursor with the --cursor hint', async () => {
    mockEvents.mockResolvedValue({ ...base, nextCursor: 'next123' });
    await run('svc', 'name');
    expect(printed()).toContain('More events exist');
    expect(printed()).toContain('--cursor next123');
  });

  test('sends none of the filters without flags', async () => {
    await run('svc', 'name');
    expect(lastOptions()).toEqual({
      from: undefined,
      to: undefined,
      type: undefined,
      limit: undefined,
      cursor: undefined
    });
  });

  test('passes --from through', async () => {
    await run('svc', 'name', '--from', '2026-11-01T00:00:00Z');
    expect(lastOptions().from).toEqual('2026-11-01T00:00:00Z');
  });

  test('passes --to through', async () => {
    await run('svc', 'name', '--to', '2026-11-02T00:00:00Z');
    expect(lastOptions().to).toEqual('2026-11-02T00:00:00Z');
  });

  test('passes --type through as a list', async () => {
    await run('svc', 'name', '--type', 'crash,oom');
    expect(lastOptions().type).toEqual(['crash', 'oom']);
  });

  test('passes --limit through as a number', async () => {
    await run('svc', 'name', '--limit', '25');
    expect(lastOptions().limit).toEqual(25);
  });

  test('passes --cursor through unchanged', async () => {
    await run('svc', 'name', '--cursor', 'abc');
    expect(lastOptions().cursor).toEqual('abc');
  });

  test('help text explains the HA standby slot', () => {
    const help = cmdEvents().helpInformation();
    expect(help).toContain('<name>b');
    expect(help).toContain('blue-green');
    expect(help).toContain('after HA is disabled');
    expect(help).toContain('for each name');
  });
});
