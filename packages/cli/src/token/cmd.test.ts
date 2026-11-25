import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Command } from 'commander';
import { cmdToken } from './cmd';
import { csvField, splitWindows } from './export';
import { confirm } from '../user/util';

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    writeFileSync: jest.fn(),
    createWriteStream: jest.fn()
  };
});
jest.mock('../user/util', () => ({
  ...jest.requireActual('../user/util'),
  confirm: jest.fn()
}));

const mockFetch = jest.fn();
const realFetch = global.fetch;
const mockConfirm = confirm as jest.Mock;

const VALUE = 'fake-token-value-do-not-use';
const policy = {
  version: 1,
  statements: [{ actions: ['myapps:read'], resources: ['myapps/*'] }]
};
const record = {
  patId: 'id-1',
  tenantId: 'tenant',
  userId: 'user',
  name: 'ci',
  description: '',
  status: 'active',
  policy,
  policyVersion: 1,
  enforcement: 'enforce',
  auditLevel: 'default',
  createdAt: '2026-11-25T10:00:00.000Z',
  createdBy: 'token:x',
  exp: 1790000000
};

type Call = {
  url: URL;
  method: string;
  body?: { [key: string]: unknown };
  headers?: Record<string, string>;
};
let calls: Call[];
let stdout: string[];
let consoleOut: string[];
let consoleErr: string[];

const httpError = (status: number, reason: string) =>
  new Response(JSON.stringify({ reason }), {
    status,
    headers: { 'content-type': 'application/json' }
  });

/** Answer the requests of the SDK, which runs for real on top of a mocked fetch. */
function route(handler: (c: Call) => unknown) {
  mockFetch.mockImplementation(async (url: URL, init?: RequestInit) => {
    const call: Call = {
      url,
      method: init?.method ?? 'GET',
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
      headers: init?.headers as Record<string, string>
    };
    calls.push(call);
    const result = handler(call);
    if (result instanceof Response) return result;
    if (result === '') return new Response(null, { status: 204 });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  });
}

async function run(...args: string[]) {
  const cli = new Command();
  cli.option('--env <environment>', 'Environment', 'prod');
  cli.option('--json', 'json');
  cli.addCommand(cmdToken());
  await cli.parseAsync(['node', 'cli', '--env', 'dev', ...args]);
}

const params = (n: number) => calls[n].url.searchParams;

describe('osc token', () => {
  let writeSpy: jest.SpyInstance;
  let fileSpies: jest.SpyInstance[];

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
    mockConfirm.mockReset();
    calls = [];
    stdout = [];
    consoleOut = [];
    consoleErr = [];
    process.exitCode = undefined;
    process.env.OSC_ACCESS_TOKEN = 'fake-pat';
    writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation(((
      chunk: unknown,
      cb?: unknown
    ) => {
      stdout.push(String(chunk));
      if (typeof cb === 'function') cb();
      return true;
    }) as never);
    jest.spyOn(process.stderr, 'write').mockImplementation(((
      chunk: unknown
    ) => {
      consoleErr.push(String(chunk));
      return true;
    }) as never);
    jest
      .spyOn(console, 'log')
      .mockImplementation((...a) => void consoleOut.push(a.join(' ') + '\n'));
    jest
      .spyOn(console, 'error')
      .mockImplementation((...a) => void consoleErr.push(a.join(' ') + '\n'));
    const actual = jest.requireActual('fs');
    fileSpies = [
      fs.writeFileSync as unknown as jest.SpyInstance,
      fs.createWriteStream as unknown as jest.SpyInstance
    ];
    (fs.writeFileSync as jest.Mock)
      .mockReset()
      .mockImplementation(actual.writeFileSync);
    (fs.createWriteStream as jest.Mock)
      .mockReset()
      .mockImplementation(actual.createWriteStream);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = realFetch;
    process.exitCode = undefined;
  });

  describe('create', () => {
    it('with both --template and --policy exits 1 with no request', async () => {
      await run(
        'token',
        'create',
        '--name',
        'n',
        '--template',
        'viewer',
        '--policy',
        'p.json'
      );
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    it('with neither --template nor --policy exits 1 with no request', async () => {
      await run('token', 'create', '--name', 'n');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    it('without --name exits 1 with no request', async () => {
      await run('token', 'create', '--template', 'viewer');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    it('prints the not-enabled message on a 404 from POST /tokens', async () => {
      route(() => httpError(404, 'not found'));
      await run('token', 'create', '--name', 'n', '--template', 'viewer');
      expect(process.exitCode).toBe(1);
      expect(consoleErr.join('')).toContain(
        'Creating access tokens is not enabled in dev yet'
      );
    });

    it('prints the server reason on a 503', async () => {
      route(() => httpError(503, 'token store not configured'));
      await run('token', 'create', '--name', 'n', '--template', 'viewer');
      expect(process.exitCode).toBe(1);
      expect(consoleErr.join('')).toContain('token store not configured');
    });

    it('--template viewer prints only the value on stdout and nowhere else', async () => {
      route(() => ({ ...record, token: VALUE }));
      await run('token', 'create', '--name', 'ci', '--template', 'viewer');
      expect(process.exitCode).toBeUndefined();
      expect(stdout).toEqual([VALUE + '\n']);
      expect(consoleOut.join('')).not.toContain(VALUE);
      expect(consoleErr.join('')).not.toContain(VALUE);
      expect(consoleErr.join('')).toContain(
        'shown once and cannot be retrieved'
      );
      expect(consoleErr.join('')).toContain('id-1');
      fileSpies.forEach((s) => expect(s).not.toHaveBeenCalled());
      expect(calls[0].method).toBe('POST');
      expect(calls[0].url.toString()).toBe(
        'https://token.svc.dev.osaas.io/tokens'
      );
      expect(calls[0].body).toEqual({ name: 'ci', template: 'viewer' });
    });

    it('--json prints the whole create response on stdout', async () => {
      route(() => ({ ...record, token: VALUE }));
      await run(
        '--json',
        'token',
        'create',
        '--name',
        'ci',
        '--template',
        'viewer'
      );
      expect(JSON.parse(stdout.join(''))).toEqual({ ...record, token: VALUE });
      expect(consoleOut.join('')).not.toContain(VALUE);
    });

    it('--expires-in-days becomes expiresInSeconds and --policy is read from a file', async () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'osc-token-'));
      const file = path.join(dir, 'policy.json');
      fs.writeFileSync(file, JSON.stringify(policy));
      fileSpies.forEach((s) => s.mockClear());
      route(() => ({ ...record, token: VALUE }));
      await run(
        'token',
        'create',
        '--name',
        'ci',
        '--description',
        'for ci',
        '--policy',
        file,
        '--expires-in-days',
        '1'
      );
      fs.rmSync(dir, { recursive: true });
      expect(process.exitCode).toBeUndefined();
      expect(calls[0].body).toEqual({
        name: 'ci',
        description: 'for ci',
        policy,
        expiresInSeconds: 86400
      });
    });

    it('rejects an unreadable policy file before any request', async () => {
      await run(
        'token',
        'create',
        '--name',
        'n',
        '--policy',
        '/nonexistent/p.json'
      );
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });
  });

  describe('list', () => {
    it('follows every page and prints the scope notice', async () => {
      route((c) =>
        c.url.searchParams.get('after') === 'id-1'
          ? {
              items: [{ ...record, patId: 'id-2', name: 'second' }],
              scope: 'own'
            }
          : { items: [record], scope: 'own', next: 'id-1' }
      );
      await run('token', 'list');
      expect(calls).toHaveLength(2);
      expect(params(1).get('after')).toBe('id-1');
      const printed = consoleOut.join('');
      expect(printed).toContain('id-1');
      expect(printed).toContain('id-2');
      expect(consoleErr.join('')).toContain('Showing your own tokens only');
      expect(process.exitCode).toBeUndefined();
    });

    it('warns when the role lookup is unavailable and prints no scope notice for a tenant scope', async () => {
      route(() => ({ items: [], scope: 'tenant', roleLookup: 'unavailable' }));
      await run('token', 'list');
      expect(consoleErr.join('')).toContain('could not be resolved');
      expect(consoleErr.join('')).not.toContain('own tokens only');
    });
  });

  describe('set-policy', () => {
    const file = () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'osc-token-'));
      const f = path.join(dir, 'policy.json');
      fs.writeFileSync(f, JSON.stringify(policy));
      return { dir, f };
    };

    it('on 409 exits 1 and does not retry', async () => {
      const { dir, f } = file();
      route(() => httpError(409, 'policy version mismatch'));
      await run(
        'token',
        'set-policy',
        'id-1',
        '--policy',
        f,
        '--expected-version',
        '1'
      );
      fs.rmSync(dir, { recursive: true });
      expect(process.exitCode).toBe(1);
      expect(calls).toHaveLength(1);
      expect(consoleErr.join('')).toContain('changed since version 1');
    });

    it('replaces the policy with expectedVersion', async () => {
      const { dir, f } = file();
      route(() => ({ ...record, policyVersion: 2 }));
      await run(
        'token',
        'set-policy',
        'id-1',
        '--policy',
        f,
        '--expected-version',
        '1'
      );
      fs.rmSync(dir, { recursive: true });
      expect(process.exitCode).toBeUndefined();
      expect(calls[0].method).toBe('PUT');
      expect(calls[0].body).toEqual({ policy, expectedVersion: 1 });
      expect(consoleOut.join('')).toContain('policy version is now 2');
    });

    it('requires a whole-number --expected-version', async () => {
      const { dir, f } = file();
      await run(
        'token',
        'set-policy',
        'id-1',
        '--policy',
        f,
        '--expected-version',
        'x'
      );
      fs.rmSync(dir, { recursive: true });
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });
  });

  describe('update, disable, enable, describe, simulate', () => {
    it('describe prints the record', async () => {
      route(() => record);
      await run('token', 'describe', 'id-1');
      expect(consoleOut.join('')).toContain('Policy version: 1');
    });

    it('prints the server reason on a 404 of an id route', async () => {
      route(() => httpError(404, 'token not found'));
      await run('token', 'describe', 'nope');
      expect(process.exitCode).toBe(1);
      expect(consoleErr.join('')).toContain('token not found');
    });

    it('disable and enable PATCH status', async () => {
      route(() => record);
      await run('token', 'disable', 'id-1');
      await run('token', 'enable', 'id-1');
      expect(calls.map((c) => [c.method, c.body])).toEqual([
        ['PATCH', { status: 'disabled' }],
        ['PATCH', { status: 'active' }]
      ]);
    });

    it('update sends only the given fields and never exp', async () => {
      route(() => record);
      await run(
        'token',
        'update',
        'id-1',
        '--name',
        'new',
        '--audit-level',
        'full'
      );
      expect(calls[0].body).toEqual({ name: 'new', auditLevel: 'full' });
    });

    it('update with nothing to change exits 1 with no request', async () => {
      await run('token', 'update', 'id-1');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    it('simulate prints allowed and denied with the reason', async () => {
      route((c) =>
        c.body?.resource === 'myapps/web'
          ? { allowed: true }
          : { allowed: false, reason: 'no_matching_statement' }
      );
      await run(
        'token',
        'simulate',
        'id-1',
        '--action',
        'myapps:read',
        '--resource',
        'myapps/web'
      );
      await run(
        'token',
        'simulate',
        'id-1',
        '--action',
        'myapps:read',
        '--resource',
        'secrets/x'
      );
      expect(consoleOut.join('')).toContain('allowed\n');
      expect(consoleOut.join('')).toContain('denied: no_matching_statement');
    });
  });

  describe('delete', () => {
    it('--yes sends DELETE without prompting', async () => {
      route(() => '');
      await run('token', 'delete', 'id-1', '--yes');
      expect(mockConfirm).not.toHaveBeenCalled();
      expect(calls).toHaveLength(1);
      expect(calls[0].method).toBe('DELETE');
      expect(process.exitCode).toBeUndefined();
    });

    it('without --yes asks and deletes on yes', async () => {
      mockConfirm.mockResolvedValue(undefined);
      route(() => '');
      await run('token', 'delete', 'id-1');
      expect(mockConfirm).toHaveBeenCalledTimes(1);
      expect(calls).toHaveLength(1);
    });

    it('without --yes and an aborted prompt sends no request and exits 1', async () => {
      mockConfirm.mockRejectedValue(new Error('aborted by user'));
      await run('token', 'delete', 'id-1');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });
  });

  describe('audit read', () => {
    it('is a read: default limit 100, no export parameter, newest first as returned', async () => {
      route(() => ({
        items: [
          { eventId: 'b', ts: '2026-11-25T10:01:00.000Z', kind: 'authz.deny' },
          { eventId: 'a', ts: '2026-11-25T10:00:00.000Z', kind: 'authz.deny' }
        ],
        scope: 'tenant'
      }));
      await run('token', 'audit', '--token', 'id-1', '--kind', 'authz.deny');
      expect(calls).toHaveLength(1);
      expect(params(0).get('limit')).toBe('100');
      expect(params(0).get('patId')).toBe('id-1');
      expect(params(0).has('export')).toBe(false);
      const lines = consoleOut.join('').trim().split('\n');
      expect(lines[0]).toContain('10:01:00');
      expect(lines[1]).toContain('10:00:00');
    });

    it('--json prints items and scope', async () => {
      route(() => ({ items: [{ eventId: 'a' }], scope: 'own' }));
      await run('--json', 'token', 'audit');
      expect(JSON.parse(stdout.join(''))).toEqual({
        items: [{ eventId: 'a' }],
        scope: 'own'
      });
      expect(consoleErr.join('')).toContain('Showing your own tokens only');
    });

    it('--user of someone else on 403 insufficient_role exits 1 and prints the reason', async () => {
      route(() => httpError(403, 'insufficient_role'));
      await run('token', 'audit', '--user', 'other');
      expect(process.exitCode).toBe(1);
      expect(consoleErr.join('')).toContain('insufficient_role');
    });

    it('collects pages up to --limit', async () => {
      route((c) =>
        c.url.searchParams.get('cursor')
          ? { items: [{ eventId: 'c' }, { eventId: 'd' }], scope: 'tenant' }
          : {
              items: [{ eventId: 'a' }, { eventId: 'b' }],
              scope: 'tenant',
              next: 'k'
            }
      );
      await run('--json', 'token', 'audit', '--limit', '3');
      expect(
        JSON.parse(stdout.join('')).items.map(
          (e: { eventId: string }) => e.eventId
        )
      ).toEqual(['a', 'b', 'c']);
    });

    it('rejects a bad --limit with no request', async () => {
      await run('token', 'audit', '--limit', '0');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });
  });

  describe('audit export', () => {
    const FROM = '2026-11-25T10:00:00.000Z';
    const TO = '2026-11-25T11:00:00.000Z';

    it('without --from and --to exits 1 with no request', async () => {
      await run('token', 'audit', '--export', 'ndjson');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    it('with only --from exits 1 with no request', async () => {
      await run('token', 'audit', '--export', 'csv', '--from', FROM);
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    it('with an unknown format exits 1 with no request', async () => {
      await run(
        'token',
        'audit',
        '--export',
        'xml',
        '--from',
        FROM,
        '--to',
        TO
      );
      expect(mockFetch).not.toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });

    it('on 403 insufficient_scope prints the reason and exits 1', async () => {
      route(() => httpError(403, 'insufficient_scope'));
      await run(
        'token',
        'audit',
        '--export',
        'ndjson',
        '--from',
        FROM,
        '--to',
        TO
      );
      expect(process.exitCode).toBe(1);
      expect(consoleErr.join('')).toContain('insufficient_scope');
    });

    const events = [
      {
        eventId: 'e3',
        ts: '2026-11-25T10:30:00.000Z',
        kind: 'authz.deny',
        details: { a: 1 }
      },
      { eventId: 'e2', ts: '2026-11-25T10:20:00.000Z', kind: 'authz.deny' },
      { eventId: 'e1', ts: '2026-11-25T10:10:00.000Z', kind: 'token.created' }
    ];

    it('ndjson over two pages writes exactly the returned rows, one per line, in order', async () => {
      route((c) =>
        c.url.searchParams.get('cursor') === 'c1'
          ? { items: [events[2]], scope: 'tenant' }
          : { items: [events[0], events[1]], scope: 'tenant', next: 'c1' }
      );
      await run(
        'token',
        'audit',
        '--export',
        'ndjson',
        '--from',
        FROM,
        '--to',
        TO
      );
      expect(process.exitCode).toBeUndefined();
      expect(calls).toHaveLength(2);
      expect(params(0).get('export')).toBe('true');
      expect(params(1).get('export')).toBe('true');
      expect(params(1).get('cursor')).toBe('c1');
      expect(params(0).get('limit')).toBe('500');
      expect(stdout.join('')).toBe(
        events.map((e) => JSON.stringify(e)).join('\n') + '\n'
      );
    });

    it('csv writes one header row and quotes a field with a comma, a quote and a newline', async () => {
      const tricky = 'a,"b"\nc';
      route(() => ({
        items: [
          {
            eventId: 'e1',
            ts: '2026-11-25T10:10:00.000Z',
            kind: 'authz.deny',
            userAgent: tricky,
            statusCode: 403,
            details: { why: 'x,y', n: 1 }
          }
        ],
        scope: 'tenant'
      }));
      await run(
        'token',
        'audit',
        '--export',
        'csv',
        '--from',
        FROM,
        '--to',
        TO
      );
      const text = stdout.join('');
      const [header, ...rest] = text.split('\r\n');
      expect(header).toBe(
        'eventId,ts,tenantId,userId,patId,tokenType,actor,service,requestId,kind,action,resource,decision,reason,policyVersion,sourceIp,userAgent,method,routeTemplate,statusCode,details,count,firstTs,lastTs'
      );
      expect(text.match(/eventId,ts,tenantId/g)).toHaveLength(1);
      const row = rest.join('\r\n');
      expect(row).toContain('"a,""b""\nc"');
      expect(row).toContain(
        `"${JSON.stringify({ why: 'x,y', n: 1 }).replace(/"/g, '""')}"`
      );
      expect(row).toContain(',403,');
    });

    it('--output writes to a file and nothing else to stdout', async () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'osc-token-'));
      const file = path.join(dir, 'out.ndjson');
      route(() => ({ items: events, scope: 'tenant' }));
      await run(
        'token',
        'audit',
        '--export',
        'ndjson',
        '--from',
        FROM,
        '--to',
        TO,
        '--output',
        file
      );
      const written = fs.readFileSync(file, 'utf8');
      fs.rmSync(dir, { recursive: true });
      expect(written).toBe(
        events.map((e) => JSON.stringify(e)).join('\n') + '\n'
      );
      expect(stdout).toEqual([]);
      expect(process.exitCode).toBeUndefined();
    });

    it('a 40-day range makes two windows of 31 and 9 days, newest first, with no shared instant', async () => {
      const from = Date.parse('2026-10-01T00:00:00.000Z');
      const to = from + 40 * 24 * 3600 * 1000;
      route(() => ({ items: [], scope: 'tenant' }));
      await run(
        'token',
        'audit',
        '--export',
        'ndjson',
        '--from',
        new Date(from).toISOString(),
        '--to',
        new Date(to).toISOString()
      );
      expect(calls).toHaveLength(2);
      const span = (n: number) =>
        (Date.parse(String(params(n).get('to'))) -
          Date.parse(String(params(n).get('from')))) /
        86400000;
      expect(span(0)).toBe(31);
      expect(span(1)).toBeCloseTo(9, 3);
      expect(params(0).get('to')).toBe(new Date(to).toISOString());
      expect(params(1).get('from')).toBe(new Date(from).toISOString());
      expect(Date.parse(String(params(1).get('to')))).toBe(
        Date.parse(String(params(0).get('from'))) - 1
      );
      expect(
        calls.every((c) => c.url.searchParams.get('export') === 'true')
      ).toBe(true);
    });

    it('a window that reaches 500000 rows stops and names the last ts written', async () => {
      let page = 0;
      let lines = 0;
      writeSpy.mockImplementation(((chunk: unknown, cb?: unknown) => {
        lines += String(chunk).split('\n').length - 1;
        if (typeof cb === 'function') cb();
        return true;
      }) as never);
      route(() => {
        page += 1;
        return {
          items: Array.from({ length: 500 }, (_, i) => ({
            eventId: `e${page}-${i}`,
            ts: `2026-11-25T10:00:00.${String(page % 1000).padStart(3, '0')}Z`,
            kind: 'authz.allow'
          })),
          scope: 'tenant',
          next: `c${page}`
        };
      });
      const from = Date.parse('2026-10-01T00:00:00.000Z');
      await run(
        'token',
        'audit',
        '--export',
        'ndjson',
        '--from',
        new Date(from).toISOString(),
        '--to',
        new Date(from + 40 * 24 * 3600 * 1000).toISOString()
      );
      expect(lines).toBe(500000);
      expect(calls).toHaveLength(1000);
      const message = consoleErr.join('');
      expect(message).toContain('limit of 500000');
      expect(message).toContain('last ts written is 2026-11-25T10:00:00.000Z');
      expect(process.exitCode).toBeUndefined();
    }, 60000);

    it('prints the scope notice once for an export', async () => {
      route((c) =>
        c.url.searchParams.get('cursor')
          ? { items: [], scope: 'own' }
          : { items: [events[0]], scope: 'own', next: 'c' }
      );
      await run(
        'token',
        'audit',
        '--export',
        'ndjson',
        '--from',
        FROM,
        '--to',
        TO
      );
      expect(consoleErr.join('').match(/own tokens only/g)).toHaveLength(1);
    });
  });
});

describe('export helpers', () => {
  it('csvField leaves plain values alone and quotes the special ones', () => {
    expect(csvField('plain')).toBe('plain');
    expect(csvField(7)).toBe('7');
    expect(csvField(undefined)).toBe('');
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField('l1\r\nl2')).toBe('"l1\r\nl2"');
  });

  it('splitWindows returns one window for a short range and a single instant', () => {
    const t = Date.parse('2026-11-25T10:00:00.000Z');
    expect(splitWindows(t, t)).toEqual([
      { from: '2026-11-25T10:00:00.000Z', to: '2026-11-25T10:00:00.000Z' }
    ]);
    expect(splitWindows(t, t + 3600000)).toHaveLength(1);
  });
});
