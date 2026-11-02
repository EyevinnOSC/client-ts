import { FetchError, createFetch } from '@osaas/client-core';
import { Command } from 'commander';
import cmdAdmin from './cmd';

jest.mock('@osaas/client-core', () => ({
  ...jest.requireActual('@osaas/client-core'),
  createFetch: jest.fn()
}));

const mockFetch = createFetch as jest.Mock;
const REPO = 'https://github.com/Eyevinn/open-live';

type Phase = string;

function setup(opts: {
  makerLists: { orderId: string; phase: Phase }[][]; // after the sync, consumed in order (last repeats)
  syncStatus?: object;
}) {
  const lists = [...opts.makerLists];
  let first = true;
  mockFetch.mockImplementation(async (url: URL, init?: { method?: string }) => {
    const u = url.toString();
    if (u.startsWith('https://catalog.svc')) {
      return { serviceMetadata: { repoUrl: REPO } };
    }
    if (u.includes('/sync-fork/by-repo')) {
      return (
        opts.syncStatus ?? { jobId: 'j', repositoryUrl: REPO, status: 'done' }
      );
    }
    if (u.endsWith('/sync-fork') && init?.method === 'POST') {
      return { jobId: 'j1' };
    }
    if (u.includes('/maker?repositoryUrl=')) {
      if (first) {
        first = false;
        return (opts.makerLists.length ? opts.makerLists[0] : []).map((o) => ({
          order: { orderId: o.orderId, status: { phase: o.phase } }
        }));
      }
      const next = lists.length > 1 ? lists.shift()! : lists[0];
      return next.map((o) => ({
        order: { orderId: o.orderId, status: { phase: o.phase } }
      }));
    }
    throw new Error(`unexpected request ${u}`);
  });
}

async function run(args: string[]) {
  const cli = new Command();
  cli.option('--env <env>');
  cli.addCommand(cmdAdmin());
  const p = cli.parseAsync(
    ['node', 'cli', '--env', 'dev', 'admin', ...args].filter(
      Boolean
    ) as string[]
  );
  // advance fake timers while the command polls
  for (let i = 0; i < 60; i++) {
    await jest.advanceTimersByTimeAsync(5000);
  }
  await p;
}

const urls = () => mockFetch.mock.calls.map((c) => c[0].toString() as string);

describe('admin sync-fork --repository-url', () => {
  let logSpy: jest.SpyInstance;
  let errSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    mockFetch.mockReset();
    process.exitCode = undefined;
    process.env.OSC_API_KEY = 'narrow';
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    logSpy.mockRestore();
    errSpy.mockRestore();
    process.exitCode = undefined;
  });

  it('skips the catalog lookup and triggers sync without --wait', async () => {
    setup({ makerLists: [[]] });
    await run(['sync-fork', '--repository-url', REPO]);
    expect(urls().some((u) => u.includes('catalog.svc'))).toBe(false);
    expect(urls().some((u) => u.endsWith('/sync-fork'))).toBe(true);
    expect(process.exitCode).toBeUndefined();
  });

  it('serviceId path still performs the catalog lookup', async () => {
    setup({ makerLists: [[]] });
    await run(['sync-fork', 'eyevinn-open-live']);
    expect(urls()[0]).toBe(
      'https://catalog.svc.dev.osaas.io/service/eyevinn-open-live'
    );
    expect(process.exitCode).toBeUndefined();
  });

  it('errors when neither serviceId nor --repository-url is given', async () => {
    await run(['sync-fork']);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('errors when both are given', async () => {
    await run(['sync-fork', 'eyevinn-open-live', '--repository-url', REPO]);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it.each([
    'https://gitlab.com/Eyevinn/open-live',
    'http://github.com/Eyevinn/open-live',
    'https://github.com/Eyevinn',
    'https://github.com/Eyevinn/open-live/tree/main',
    'https://github.com.evil.io/Eyevinn/open-live',
    'https://github.com/Eyevinn/open-live?x=1',
    'not a url'
  ])('rejects invalid URL %s before any network call', async (bad) => {
    await run(['sync-fork', '--repository-url', bad]);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it.each([REPO, `${REPO}.git`])('accepts valid URL %s', async (good) => {
    setup({ makerLists: [[]] });
    await run(['sync-fork', '--repository-url', good]);
    expect(mockFetch).toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it('--wait: new order goes through active phases to DONE, exit 0, no GET /maker/<id>', async () => {
    setup({
      makerLists: [
        [{ orderId: 'old', phase: 'DONE' }], // snapshot
        [{ orderId: 'old', phase: 'DONE' }], // not yet created
        [
          { orderId: 'old', phase: 'DONE' },
          { orderId: 'new', phase: 'PENDING' }
        ],
        [
          { orderId: 'old', phase: 'DONE' },
          { orderId: 'new', phase: 'RUNNING' }
        ],
        [
          { orderId: 'old', phase: 'DONE' },
          { orderId: 'new', phase: 'DONE' }
        ]
      ]
    });
    await run(['sync-fork', '--repository-url', REPO, '--wait']);
    expect(process.exitCode).toBeUndefined();
    expect(urls().some((u) => /\/maker\/[^?]/.test(u))).toBe(false);
    expect(urls().some((u) => u.includes('catalog.svc'))).toBe(false);
  });

  it('--wait: rebuild reusing the orderId (DONE -> PENDING -> DONE) is followed', async () => {
    setup({
      makerLists: [
        [{ orderId: 'o1', phase: 'DONE' }],
        [{ orderId: 'o1', phase: 'PENDING' }],
        [{ orderId: 'o1', phase: 'DONE' }]
      ]
    });
    await run(['sync-fork', '--repository-url', REPO, '--wait']);
    expect(process.exitCode).toBeUndefined();
  });

  it('--wait: failed order phase exits non-zero', async () => {
    setup({
      makerLists: [
        [],
        [{ orderId: 'new', phase: 'RUNNING' }],
        [{ orderId: 'new', phase: 'ERROR' }]
      ]
    });
    await run(['sync-fork', '--repository-url', REPO, '--wait']);
    expect(process.exitCode).toBe(1);
    expect(errSpy.mock.calls.join('\n')).toContain('ERROR');
  });

  it('--wait: no-change run (only stale DONE order) exits 0 after the 60s grace and stops polling', async () => {
    setup({ makerLists: [[{ orderId: 'old', phase: 'DONE' }]] });
    await run(['sync-fork', '--repository-url', REPO, '--wait']);
    expect(process.exitCode).toBeUndefined();
    expect(logSpy.mock.calls.join('\n')).toContain(
      'Sync fork succeeded; no remake order appeared within 60s (fork was likely already up to date)'
    );
    // 1 snapshot + polls at 0s, 5s, ..., 60s = 13, and nothing after the grace
    const makerCalls = urls().filter((u) =>
      u.includes('/maker?repositoryUrl=')
    );
    expect(makerCalls).toHaveLength(14);
    expect(urls().some((u) => /\/maker\/[^?]/.test(u))).toBe(false);
  });

  it('--wait: order appearing late inside the grace is still waited to DONE', async () => {
    const stale = [{ orderId: 'old', phase: 'DONE' }];
    setup({
      makerLists: [
        stale,
        ...Array(10).fill(stale),
        [...stale, { orderId: 'new', phase: 'RUNNING' }],
        [...stale, { orderId: 'new', phase: 'DONE' }]
      ]
    });
    await run(['sync-fork', '--repository-url', REPO, '--wait']);
    expect(process.exitCode).toBeUndefined();
    expect(logSpy.mock.calls.join('\n')).not.toContain('no remake order');
  });

  it('--wait: order appearing inside the grace and failing exits 1', async () => {
    const stale = [{ orderId: 'old', phase: 'DONE' }];
    setup({
      makerLists: [stale, stale, [...stale, { orderId: 'new', phase: 'ERROR' }]]
    });
    await run(['sync-fork', '--repository-url', REPO, '--wait']);
    expect(process.exitCode).toBe(1);
  });

  it('--wait: sync-fork failure exits non-zero', async () => {
    setup({
      makerLists: [[]],
      syncStatus: {
        jobId: 'j',
        repositoryUrl: REPO,
        status: 'failed',
        error: { type: 'conflict', message: 'merge conflict' }
      }
    });
    await run(['sync-fork', '--repository-url', REPO, '--wait']);
    expect(process.exitCode).toBe(1);
  });

  it('request errors on the url path exit non-zero', async () => {
    mockFetch.mockRejectedValue(
      new FetchError({ message: 'forbidden', httpCode: 403 })
    );
    await run(['sync-fork', '--repository-url', REPO]);
    expect(process.exitCode).toBe(1);
  });
});
