import { Context } from './context';
import { waitForJobToComplete } from './job';

// Mock the core module so getJob returns controllable status values
jest.mock('./core', () => ({
  getService: jest.fn().mockResolvedValue({ serviceType: 'job' }),
  getInstance: jest.fn(),
  createInstance: jest.fn(),
  removeInstance: jest.fn(),
  listInstances: jest.fn()
}));

import { getInstance } from './core';

const mockGetInstance = getInstance as jest.MockedFunction<typeof getInstance>;

describe('waitForJobToComplete', () => {
  const ctx = new Context({ personalAccessToken: 'dummy' });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('resolves when job status is Complete', async () => {
    mockGetInstance.mockResolvedValue({ status: 'Complete' });
    await expect(
      waitForJobToComplete(ctx, 'eyevinn-test-job', 'myjob', 'token')
    ).resolves.toBeUndefined();
    expect(mockGetInstance).toHaveBeenCalledTimes(1);
  });

  test('resolves when job status is SuccessCriteriaMet', async () => {
    mockGetInstance.mockResolvedValue({ status: 'SuccessCriteriaMet' });
    await expect(
      waitForJobToComplete(ctx, 'eyevinn-test-job', 'myjob', 'token')
    ).resolves.toBeUndefined();
    expect(mockGetInstance).toHaveBeenCalledTimes(1);
  });

  test('throws when job status is Failed', async () => {
    mockGetInstance.mockResolvedValue({ status: 'Failed' });
    await expect(
      waitForJobToComplete(ctx, 'eyevinn-test-job', 'myjob', 'token')
    ).rejects.toThrow("Job 'myjob' failed with status: Failed");
    expect(mockGetInstance).toHaveBeenCalledTimes(1);
  });

  test('polls until job reaches terminal status', async () => {
    mockGetInstance
      .mockResolvedValueOnce({ status: 'Running' })
      .mockResolvedValueOnce({ status: 'Running' })
      .mockResolvedValueOnce({ status: 'SuccessCriteriaMet' });

    // Speed up the delay for tests
    jest.useFakeTimers();
    const promise = waitForJobToComplete(
      ctx,
      'eyevinn-test-job',
      'myjob',
      'token'
    );
    // Advance timers past each 1s delay
    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBeUndefined();
    expect(mockGetInstance).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });
});
