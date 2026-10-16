import { FetchError } from '@osaas/client-core';
import { Command } from 'commander';
import cmdAdmin from './cmd';
import { getInstancesToRemove, suspendInstanceForTenant } from './instance';
import { getTenantPlanMap, getTenantTokenCounts } from './money';

jest.mock('./instance', () => ({
  getInstancesToRemove: jest.fn(),
  listInstancesForTenant: jest.fn(),
  removeInstanceForTenant: jest.fn(),
  suspendInstanceForTenant: jest.fn()
}));
jest.mock('./money', () => ({
  getTenantPlanMap: jest.fn(),
  getTenantTokenCounts: jest.fn()
}));

const mockInstances = getInstancesToRemove as jest.Mock;
const mockSuspend = suspendInstanceForTenant as jest.Mock;

async function run() {
  const cli = new Command();
  cli.addCommand(cmdAdmin());
  await cli.parseAsync([
    'node',
    'cli',
    'admin',
    'remove-exceeding-tenant-instances',
    '--apply'
  ]);
}

describe('remove-exceeding-tenant-instances', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    process.exitCode = undefined;
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    (getTenantPlanMap as jest.Mock).mockResolvedValue({
      t1: { planType: 'FREE' }
    });
    (getTenantTokenCounts as jest.Mock).mockResolvedValue([
      { tenantId: 't1', remainingTokens: -500 }
    ]);
    mockInstances.mockResolvedValue([{ serviceId: 's', instance: 'i' }]);
  });

  afterEach(() => {
    logSpy.mockRestore();
    process.exitCode = undefined;
  });

  const summary = () =>
    logSpy.mock.calls
      .map((c) => String(c[0]))
      .find((l) => /tenants below/.test(l));

  it('suspends on 200', async () => {
    mockSuspend.mockResolvedValue(undefined);
    await run();
    expect(mockSuspend).toHaveBeenCalledTimes(1);
    expect(summary()).toContain('suspended 1 instances, 0 instance failures');
    expect(summary()).toContain(', 0 already suspended');
    expect(process.exitCode).toBeUndefined();
  });

  it('treats 409 already suspended as an idempotent skip', async () => {
    mockSuspend.mockRejectedValue(
      new FetchError({
        message: 'Instance is already suspended',
        httpCode: 409
      })
    );
    await run();
    expect(summary()).toContain('suspended 0 instances, 0 instance failures');
    expect(summary()).toContain(', 1 already suspended');
    expect(process.exitCode).toBeUndefined();
  });

  it.each([
    'Instance suspension state could not be verified',
    'Instance is running under a stale suspension record and was not re-suspended'
  ])('treats other 409 reason as failure: %s', async (message) => {
    mockSuspend.mockRejectedValue(new FetchError({ message, httpCode: 409 }));
    await run();
    expect(summary()).toContain('1 instance failures');
    expect(summary()).toContain(', 0 already suspended');
    expect(process.exitCode).toBe(1);
  });

  it('treats 500 as failure', async () => {
    mockSuspend.mockRejectedValue(
      new FetchError({ message: 'boom', httpCode: 500 })
    );
    await run();
    expect(summary()).toContain('1 instance failures');
    expect(process.exitCode).toBe(1);
  });
});
