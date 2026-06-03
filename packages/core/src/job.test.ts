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
    jest.useRealTimers();
  });

  test('resolves when job status is Complete', async () => {
    const completedJob = { name: 'myjob', status: 'Complete' };
    mockGetInstance.mockResolvedValue(completedJob);
    const result = await waitForJobToComplete(
      ctx,
      'eyevinn-test-job',
      'myjob',
      'token'
    );
    expect(result).toEqual(completedJob);
    expect(mockGetInstance).toHaveBeenCalledTimes(1);
  });

  test('resolves when job status is SuccessCriteriaMet', async () => {
    const completedJob = { name: 'myjob', status: 'SuccessCriteriaMet' };
    mockGetInstance.mockResolvedValue(completedJob);
    const result = await waitForJobToComplete(
      ctx,
      'eyevinn-test-job',
      'myjob',
      'token'
    );
    expect(result).toEqual(completedJob);
    expect(mockGetInstance).toHaveBeenCalledTimes(1);
  });

  test('throws when job status is Failed', async () => {
    mockGetInstance.mockResolvedValue({ status: 'Failed' });
    await expect(
      waitForJobToComplete(ctx, 'eyevinn-test-job', 'myjob', 'token')
    ).rejects.toThrow("Job 'myjob' failed with status: Failed");
    expect(mockGetInstance).toHaveBeenCalledTimes(1);
  });

  test('throws when job status is FailureTarget', async () => {
    mockGetInstance.mockResolvedValue({ status: 'FailureTarget' });
    await expect(
      waitForJobToComplete(ctx, 'eyevinn-test-job', 'myjob', 'token')
    ).rejects.toThrow("Job 'myjob' failed with status: FailureTarget");
    expect(mockGetInstance).toHaveBeenCalledTimes(1);
  });

  test('polls until job reaches terminal status', async () => {
    const completedJob = { name: 'myjob', status: 'SuccessCriteriaMet' };
    mockGetInstance
      .mockResolvedValueOnce({ status: 'Running' })
      .mockResolvedValueOnce({ status: 'Running' })
      .mockResolvedValueOnce(completedJob);

    jest.useFakeTimers();
    const promise = waitForJobToComplete(
      ctx,
      'eyevinn-test-job',
      'myjob',
      'token'
    );
    await jest.runAllTimersAsync();
    const result = await promise;
    expect(result).toEqual(completedJob);
    expect(mockGetInstance).toHaveBeenCalledTimes(3);
  });

  test('throws on timeout when timeoutMs is exceeded', async () => {
    mockGetInstance.mockResolvedValue({ status: 'Running' });

    // Spy on Date.now: first call sets the deadline, second call (the
    // per-iteration check) returns a value well past it — no timers needed.
    const base = 1_000_000;
    let calls = 0;
    const dateSpy = jest
      .spyOn(Date, 'now')
      .mockImplementation(() => (calls++ === 0 ? base : base + 10_000));

    await expect(
      waitForJobToComplete(ctx, 'eyevinn-test-job', 'myjob', 'token', {
        timeoutMs: 5000
      })
    ).rejects.toThrow("Job 'myjob' timed out after 5000ms");

    dateSpy.mockRestore();
  });

  test('backwards compatible: no options parameter works as before', async () => {
    const completedJob = { name: 'myjob', status: 'Complete' };
    mockGetInstance.mockResolvedValue(completedJob);
    // Called without options — should still resolve
    const result = await waitForJobToComplete(
      ctx,
      'eyevinn-test-job',
      'myjob',
      'token'
    );
    expect(result).toEqual(completedJob);
  });

  test('returns the completed job object with all fields', async () => {
    const completedJob = {
      name: 'myjob',
      status: 'Complete',
      output: 's3://bucket/result.mp4'
    };
    mockGetInstance.mockResolvedValue(completedJob);
    const result = await waitForJobToComplete(
      ctx,
      'eyevinn-test-job',
      'myjob',
      'token'
    );
    expect(result).toEqual(completedJob);
    expect(result.output).toBe('s3://bucket/result.mp4');
  });
});
