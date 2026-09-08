import { Context } from './context';
import { InstanceReadyTimeoutError } from './errors';

// Mock core module internals so getInstanceHealth is controllable.
// waitForInstanceReady is the function under test; we expose it from the mock
// via jest.requireActual so the real implementation runs.
jest.mock('./core', () => {
  const actual = jest.requireActual('./core');
  return {
    ...actual,
    getInstanceHealth: jest.fn()
  };
});

// Import after mock is registered.
import { waitForInstanceReady, getInstanceHealth } from './core';

const mockGetInstanceHealth = getInstanceHealth as jest.MockedFunction<
  typeof getInstanceHealth
>;

// ctx.getServiceAccessToken calls createFetch internally; mock the whole
// method on the Context prototype so tests don't need to stub fetch calls.
jest
  .spyOn(Context.prototype, 'getServiceAccessToken')
  .mockResolvedValue('mocked-sat');

describe('waitForInstanceReady', () => {
  const ctx = new Context({ personalAccessToken: 'dummy' });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('resolves when instance status is running on the first poll', async () => {
    mockGetInstanceHealth.mockResolvedValue('running');

    jest.useFakeTimers();
    const promise = waitForInstanceReady(
      'eyevinn-test-svc',
      'myinstance',
      ctx,
      { timeoutMs: 10_000, pollIntervalMs: 100 }
    );
    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBeUndefined();
    expect(mockGetInstanceHealth).toHaveBeenCalledTimes(1);
  });

  test('polls until instance reaches running state', async () => {
    mockGetInstanceHealth
      .mockResolvedValueOnce('starting')
      .mockResolvedValueOnce('starting')
      .mockResolvedValueOnce('running');

    jest.useFakeTimers();
    const promise = waitForInstanceReady(
      'eyevinn-test-svc',
      'myinstance',
      ctx,
      { timeoutMs: 10_000, pollIntervalMs: 100 }
    );
    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBeUndefined();
    expect(mockGetInstanceHealth).toHaveBeenCalledTimes(3);
  });

  test('rejects with InstanceReadyTimeoutError when timeout expires', async () => {
    mockGetInstanceHealth.mockResolvedValue('starting');

    // Spy on Date.now: first call sets the deadline, second call is past it.
    const base = 1_000_000;
    let calls = 0;
    const dateSpy = jest
      .spyOn(Date, 'now')
      .mockImplementation(() => (calls++ === 0 ? base : base + 10_000));

    await expect(
      waitForInstanceReady('eyevinn-test-svc', 'myinstance', ctx, {
        timeoutMs: 5_000
      })
    ).rejects.toThrow(InstanceReadyTimeoutError);

    dateSpy.mockRestore();
  });

  test('InstanceReadyTimeoutError message includes service and instance name', async () => {
    mockGetInstanceHealth.mockResolvedValue('starting');

    const base = 1_000_000;
    let calls = 0;
    const dateSpy = jest
      .spyOn(Date, 'now')
      .mockImplementation(() => (calls++ === 0 ? base : base + 10_000));

    await expect(
      waitForInstanceReady('eyevinn-test-svc', 'myinstance', ctx, {
        timeoutMs: 5_000
      })
    ).rejects.toThrow("Instance 'myinstance' of service 'eyevinn-test-svc'");

    dateSpy.mockRestore();
  });

  test('default timeoutMs is 300_000 (5 min) — message reflects it', async () => {
    mockGetInstanceHealth.mockResolvedValue('starting');

    const base = 1_000_000;
    let calls = 0;
    const dateSpy = jest
      .spyOn(Date, 'now')
      .mockImplementation(() => (calls++ === 0 ? base : base + 400_000));

    await expect(
      waitForInstanceReady('eyevinn-test-svc', 'myinstance', ctx)
    ).rejects.toThrow('300000ms');

    dateSpy.mockRestore();
  });

  test('rejects with AbortError when signal is already aborted', async () => {
    mockGetInstanceHealth.mockResolvedValue('starting');

    const controller = new AbortController();
    controller.abort();

    jest.useFakeTimers();
    const promise = waitForInstanceReady(
      'eyevinn-test-svc',
      'myinstance',
      ctx,
      { signal: controller.signal, pollIntervalMs: 100 }
    );
    await jest.runAllTimersAsync();

    await expect(promise).rejects.toMatchObject({
      name: 'AbortError',
      message: 'waitForInstanceReady was aborted'
    });
    // Health was never checked because signal was already aborted before the loop
    expect(mockGetInstanceHealth).toHaveBeenCalledTimes(0);
  });

  test('rejects with AbortError when signal is aborted during polling', async () => {
    const controller = new AbortController();

    // Return 'starting' once then abort after the delay
    mockGetInstanceHealth.mockImplementationOnce(async () => {
      controller.abort();
      return 'starting';
    });

    jest.useFakeTimers();
    const promise = waitForInstanceReady(
      'eyevinn-test-svc',
      'myinstance',
      ctx,
      { signal: controller.signal, pollIntervalMs: 100, timeoutMs: 60_000 }
    );
    await jest.runAllTimersAsync();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  test('backwards compatible: no opts parameter still works (resolves on running)', async () => {
    mockGetInstanceHealth.mockResolvedValue('running');

    const base = 1_000_000;
    // Date.now always returns base — well within 300 s window
    const dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => base);

    jest.useFakeTimers();
    const promise = waitForInstanceReady('eyevinn-test-svc', 'myinstance', ctx);
    await jest.runAllTimersAsync();
    await expect(promise).resolves.toBeUndefined();

    dateSpy.mockRestore();
  });
});
