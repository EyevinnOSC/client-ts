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

    // Use pollIntervalMs: 0 so delay(0) resolves immediately as a macrotask
    // without needing fake timers (real setTimeout(fn, 0) fires on next tick).
    await expect(
      waitForInstanceReady('eyevinn-test-svc', 'myinstance', ctx, {
        timeoutMs: 10_000,
        pollIntervalMs: 0
      })
    ).resolves.toBeUndefined();
    expect(mockGetInstanceHealth).toHaveBeenCalledTimes(1);
  });

  test('polls until instance reaches running state', async () => {
    mockGetInstanceHealth
      .mockResolvedValueOnce('starting')
      .mockResolvedValueOnce('starting')
      .mockResolvedValueOnce('running');

    await expect(
      waitForInstanceReady('eyevinn-test-svc', 'myinstance', ctx, {
        timeoutMs: 10_000,
        pollIntervalMs: 0
      })
    ).resolves.toBeUndefined();
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
        timeoutMs: 5_000,
        pollIntervalMs: 0
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
        timeoutMs: 5_000,
        pollIntervalMs: 0
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
      waitForInstanceReady('eyevinn-test-svc', 'myinstance', ctx, {
        pollIntervalMs: 0
      })
    ).rejects.toThrow('300000ms');

    dateSpy.mockRestore();
  });

  test('rejects with AbortError when signal is already aborted', async () => {
    mockGetInstanceHealth.mockResolvedValue('starting');

    const controller = new AbortController();
    controller.abort();

    // Signal is already aborted — the while loop never executes so no delay
    // occurs. The implementation throws a plain Error with .name = 'AbortError'
    // (DOMException is not available in the es2022 lib target).
    await expect(
      waitForInstanceReady('eyevinn-test-svc', 'myinstance', ctx, {
        signal: controller.signal,
        pollIntervalMs: 0
      })
    ).rejects.toMatchObject({
      name: 'AbortError',
      message: 'waitForInstanceReady was aborted'
    });
    // Health was never checked because signal was already aborted before the loop
    expect(mockGetInstanceHealth).toHaveBeenCalledTimes(0);
  });

  test('rejects with AbortError when signal is aborted during polling', async () => {
    const controller = new AbortController();

    // Health check aborts the signal then returns 'starting'. With
    // pollIntervalMs: 0 the delay resolves immediately so no fake timers
    // are needed. The implementation uses a plain Error with .name = 'AbortError'.
    mockGetInstanceHealth.mockImplementationOnce(async () => {
      controller.abort();
      return 'starting';
    });

    await expect(
      waitForInstanceReady('eyevinn-test-svc', 'myinstance', ctx, {
        signal: controller.signal,
        pollIntervalMs: 0,
        timeoutMs: 60_000
      })
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  test('backwards compatible: no opts parameter still works (resolves on running)', async () => {
    mockGetInstanceHealth.mockResolvedValue('running');

    // Pin Date.now so the default 300 s deadline is always in the future.
    const base = 1_000_000;
    const dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => base);

    // No opts means pollIntervalMs defaults to 1000. Use fake timers so the
    // delay(1000) resolves without a real one-second wait.
    jest.useFakeTimers();
    const promise = waitForInstanceReady('eyevinn-test-svc', 'myinstance', ctx);
    // Advance past the 1000 ms poll interval and drain pending microtasks.
    await jest.advanceTimersByTimeAsync(1100);
    await expect(promise).resolves.toBeUndefined();

    dateSpy.mockRestore();
  });
});
