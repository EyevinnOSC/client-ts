import { createWriteStream, readFileSync } from 'fs';
import { Command } from 'commander';
import {
  AccessToken,
  AccessTokenPatch,
  AuditEvent,
  AuditFilter,
  Context,
  CreateAccessTokenBody,
  FetchError,
  TokenPolicy,
  createAccessToken,
  deleteAccessToken,
  getAccessToken,
  iterateAuditEvents,
  listAccessTokens,
  replaceAccessTokenPolicy,
  simulateAccessToken,
  updateAccessToken
} from '@osaas/client-core';
import { confirm } from '../user/util';
import { MAX_EXPORT_ROWS, csvHeader, csvRow, splitWindows } from './export';

const TEMPLATES =
  'viewer, deployer, ci-publisher, agent-runner, mcp-readonly, full';
const AUDIT_PAGE_MAX = 500;
const AUDIT_READ_DEFAULT = 100;

type Cmd = { optsWithGlobals(): Record<string, unknown> };

function isJson(command: Cmd): boolean {
  return !!command.optsWithGlobals().json;
}

function contextFor(command: Cmd): { ctx: Context; environment: string } {
  const environment = String(command.optsWithGlobals().env || 'prod');
  return { ctx: new Context({ environment }), environment };
}

/** Print an error the way the command's output mode wants it and fail the run. */
function fail(command: Cmd, message: string) {
  if (isJson(command)) {
    process.stderr.write(JSON.stringify({ error: message }) + '\n');
  } else {
    console.error(message);
  }
  process.exitCode = 1;
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function printJson(value: unknown) {
  process.stdout.write(JSON.stringify(value) + '\n');
}

function readSource(source: string): string {
  return readFileSync(source === '-' ? 0 : source, 'utf8');
}

function readPolicy(source: string): TokenPolicy {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readSource(source));
  } catch (err) {
    throw new Error(
      `Could not read a JSON policy from ${
        source === '-' ? 'stdin' : source
      }: ${messageOf(err)}`
    );
  }
  return parsed as TokenPolicy;
}

function parseExpectedVersion(raw: string | undefined): number | undefined {
  if (raw === undefined || !/^\d+$/.test(raw)) return undefined;
  return Number(raw);
}

function isoOf(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toISOString();
}

function describeToken(token: AccessToken): string[] {
  return [
    `Id:             ${token.patId}`,
    `Name:           ${token.name}`,
    `Description:    ${token.description || '-'}`,
    `Status:         ${token.status}`,
    `Expires:        ${isoOf(token.exp)}`,
    `Policy version: ${token.policyVersion}`,
    `Enforcement:    ${token.enforcement}`,
    `Audit level:    ${token.auditLevel}${
      token.auditUntil ? ` (until ${token.auditUntil})` : ''
    }`,
    `Last used:      ${token.lastUsedAt ?? '-'}`,
    `Created:        ${token.createdAt} by ${token.createdBy}`,
    `Policy:         ${JSON.stringify(token.policy)}`
  ];
}

function printNotices(
  scope: string | undefined,
  roleLookup: string | undefined,
  seen: { scope: boolean; role: boolean }
) {
  if (scope === 'own' && !seen.scope) {
    seen.scope = true;
    console.error('Showing your own tokens only');
  }
  if (roleLookup === 'unavailable' && !seen.role) {
    seen.role = true;
    console.error(
      'Warning: the workspace role could not be resolved, so the result may be incomplete.'
    );
  }
}

/** Where an export is written: stdout or a file, one chunk at a time. */
interface Sink {
  write(text: string): Promise<void>;
  close(): Promise<void>;
}

function openSink(output: string | undefined): Sink {
  if (!output) {
    return {
      write: (text) =>
        new Promise((resolve, reject) => {
          process.stdout.write(text, (err) => (err ? reject(err) : resolve()));
        }),
      close: async () => undefined
    };
  }
  const stream = createWriteStream(output, { encoding: 'utf8' });
  let failure: Error | undefined;
  stream.on('error', (err) => {
    failure = err;
  });
  return {
    write: (text) =>
      new Promise((resolve, reject) => {
        if (failure) return reject(failure);
        stream.write(text, (err) => (err ? reject(err) : resolve()));
      }),
    close: () =>
      new Promise((resolve, reject) => {
        stream.end((err?: Error | null) => {
          const e = err ?? failure;
          return e ? reject(e) : resolve();
        });
      })
  };
}

export function cmdToken() {
  const token = new Command('token').description(
    'Manage fine-grained access tokens and read their audit trail'
  );

  token
    .command('list')
    .description('List access tokens of the workspace')
    .action(async (_options, command) => {
      try {
        const { ctx } = contextFor(command);
        const items: AccessToken[] = [];
        const seen = { scope: false, role: false };
        let scope: string | undefined;
        let roleLookup: string | undefined;
        let after: string | undefined;
        do {
          const page = await listAccessTokens(ctx, { after });
          items.push(...page.items);
          scope = page.scope;
          roleLookup = page.roleLookup ?? roleLookup;
          printNotices(page.scope, page.roleLookup, seen);
          after = page.next;
        } while (after);
        if (isJson(command)) {
          printJson({ items, scope, ...(roleLookup ? { roleLookup } : {}) });
          return;
        }
        for (const t of items) {
          console.log(
            [
              t.patId,
              t.name,
              t.status,
              isoOf(t.exp),
              `v${t.policyVersion}`,
              t.lastUsedAt ?? '-'
            ].join('\t')
          );
        }
      } catch (err) {
        fail(command, messageOf(err));
      }
    });

  token
    .command('describe')
    .description('Show an access token')
    .argument('<id>', 'Token id')
    .action(async (id, _options, command) => {
      try {
        const { ctx } = contextFor(command);
        const record = await getAccessToken(ctx, id);
        if (isJson(command)) {
          printJson(record);
        } else {
          describeToken(record).forEach((line) => console.log(line));
        }
      } catch (err) {
        fail(command, messageOf(err));
      }
    });

  token
    .command('create')
    .description(
      `Create an access token from a template (${TEMPLATES}) or a policy file. The token value is shown once.`
    )
    .option('--name <name>', 'Token name')
    .option('--description <text>', 'Token description')
    .option('--template <name>', `Template: ${TEMPLATES}`)
    .option('--policy <file|->', 'Policy as a JSON file, or - for stdin')
    .option(
      '--expires-in-days <n>',
      'Lifetime in days (the server default is 90)'
    )
    .action(async (options, command) => {
      try {
        if (!options.name) {
          return fail(command, '--name is required');
        }
        if (!!options.template === !!options.policy) {
          return fail(command, 'Give exactly one of --template and --policy');
        }
        const body: CreateAccessTokenBody = { name: options.name };
        if (options.description !== undefined) {
          body.description = options.description;
        }
        if (options.template) {
          body.template = options.template;
        } else {
          body.policy = readPolicy(options.policy);
        }
        if (options.expiresInDays !== undefined) {
          const days = Number(options.expiresInDays);
          if (!Number.isFinite(days) || days <= 0) {
            return fail(command, '--expires-in-days must be a positive number');
          }
          body.expiresInSeconds = Math.round(days * 86400);
        }
        const { ctx, environment } = contextFor(command);
        let created;
        try {
          created = await createAccessToken(ctx, body);
        } catch (err) {
          if (err instanceof FetchError && err.httpCode === 404) {
            return fail(
              command,
              `Creating access tokens is not enabled in ${environment} yet`
            );
          }
          throw err;
        }
        if (isJson(command)) {
          printJson(created);
          return;
        }
        // The value alone on stdout so TOKEN=$(osc token create ...) captures
        // only the value. It is never written anywhere else.
        process.stdout.write(created.token + '\n');
        const { token: _value, ...record } = created;
        void _value;
        describeToken(record).forEach((line) => console.error(line));
        console.error(
          'This value is shown once and cannot be retrieved again.'
        );
      } catch (err) {
        fail(command, messageOf(err));
      }
    });

  token
    .command('set-policy')
    .description(
      'Replace the policy of a token. The token value stays the same and policyVersion increases.'
    )
    .argument('<id>', 'Token id')
    .option('--policy <file|->', 'Policy as a JSON file, or - for stdin')
    .option('--expected-version <n>', 'The policyVersion you are replacing')
    .action(async (id, options, command) => {
      try {
        if (!options.policy) {
          return fail(command, '--policy is required');
        }
        const expectedVersion = parseExpectedVersion(options.expectedVersion);
        if (expectedVersion === undefined) {
          return fail(
            command,
            '--expected-version is required and must be a whole number'
          );
        }
        const policy = readPolicy(options.policy);
        const { ctx } = contextFor(command);
        try {
          const updated = await replaceAccessTokenPolicy(
            ctx,
            id,
            policy,
            expectedVersion
          );
          if (isJson(command)) {
            printJson(updated);
          } else {
            console.log(
              `Policy replaced, policy version is now ${updated.policyVersion}`
            );
          }
        } catch (err) {
          if (err instanceof FetchError && err.httpCode === 409) {
            return fail(
              command,
              `The policy changed since version ${expectedVersion}. Run 'osc token describe ${id}' and retry with the current version.`
            );
          }
          throw err;
        }
      } catch (err) {
        fail(command, messageOf(err));
      }
    });

  const patchCommand = async (
    id: string,
    patch: AccessTokenPatch,
    command: Cmd
  ) => {
    try {
      const { ctx } = contextFor(command);
      const updated = await updateAccessToken(ctx, id, patch);
      if (isJson(command)) {
        printJson(updated);
      } else {
        describeToken(updated).forEach((line) => console.log(line));
      }
    } catch (err) {
      fail(command, messageOf(err));
    }
  };

  token
    .command('update')
    .description(
      'Change name, description, enforcement or audit level. The expiry cannot be changed: create a new token instead.'
    )
    .argument('<id>', 'Token id')
    .option('--name <name>', 'New name')
    .option('--description <text>', 'New description')
    .option('--enforcement <mode>', 'enforce or audit')
    .option('--audit-level <level>', 'default or full')
    .action(async (id, options, command) => {
      const patch: AccessTokenPatch = {};
      if (options.name !== undefined) patch.name = options.name;
      if (options.description !== undefined) {
        patch.description = options.description;
      }
      if (options.enforcement !== undefined) {
        patch.enforcement = options.enforcement;
      }
      if (options.auditLevel !== undefined) {
        patch.auditLevel = options.auditLevel;
      }
      if (Object.keys(patch).length === 0) {
        return fail(command, 'Nothing to update');
      }
      await patchCommand(id, patch, command);
    });

  token
    .command('disable')
    .description('Disable a token. It stops working until enabled again.')
    .argument('<id>', 'Token id')
    .action(async (id, _options, command) => {
      await patchCommand(id, { status: 'disabled' }, command);
    });

  token
    .command('enable')
    .description('Enable a disabled token')
    .argument('<id>', 'Token id')
    .action(async (id, _options, command) => {
      await patchCommand(id, { status: 'active' }, command);
    });

  token
    .command('delete')
    .description('Delete a token and revoke it')
    .argument('<id>', 'Token id')
    .option('--yes', 'Do not ask for confirmation')
    .action(async (id, options, command) => {
      try {
        const { ctx } = contextFor(command);
        if (!options.yes) {
          await confirm(`Delete token ${id}? (yes/no) `);
        }
        await deleteAccessToken(ctx, id);
        if (isJson(command)) {
          printJson({ deleted: id });
        } else {
          console.log(`Deleted token ${id}`);
        }
      } catch (err) {
        fail(command, messageOf(err));
      }
    });

  token
    .command('simulate')
    .description(
      'Check whether the token policy allows an action on a resource'
    )
    .argument('<id>', 'Token id')
    .option('--action <action>', 'For example myapps:read')
    .option('--resource <resource>', 'For example myapps/web')
    .action(async (id, options, command) => {
      try {
        if (!options.action || !options.resource) {
          return fail(command, '--action and --resource are required');
        }
        const { ctx } = contextFor(command);
        const result = await simulateAccessToken(
          ctx,
          id,
          options.action,
          options.resource
        );
        if (isJson(command)) {
          printJson(result);
        } else if (result.allowed) {
          console.log('allowed');
        } else {
          console.log(`denied${result.reason ? `: ${result.reason}` : ''}`);
        }
      } catch (err) {
        fail(command, messageOf(err));
      }
    });

  token
    .command('audit')
    .description(
      'Read the audit trail (newest first), or export it as ndjson or csv with --export'
    )
    .option('--token <patId>', 'Only events of this token')
    .option('--user <userId>', 'Only events of this user')
    .option('--kind <kind>', 'Event kind, for example token.created')
    .option('--action <action>', 'Action, for example myapps:read')
    .option('--decision <decision>', 'allow or deny')
    .option(
      '--from <iso>',
      'Start of the range (ISO-8601, required for --export)'
    )
    .option('--to <iso>', 'End of the range (ISO-8601, required for --export)')
    .option(
      '--limit <n>',
      `Number of events to read (default ${AUDIT_READ_DEFAULT})`
    )
    .option('--export <format>', 'Export as ndjson or csv')
    .option('--output <file>', 'Write the export to a file instead of stdout')
    .action(async (options, command) => {
      try {
        const filter: AuditFilter = {};
        if (options.token) filter.patId = options.token;
        if (options.user) filter.userId = options.user;
        if (options.kind) filter.kind = options.kind;
        if (options.action) filter.action = options.action;
        if (options.decision) filter.decision = options.decision;
        if (options.from) filter.from = options.from;
        if (options.to) filter.to = options.to;
        if (options.export !== undefined) {
          await exportAudit(command, filter, options);
        } else {
          await readAudit(command, filter, options.limit);
        }
      } catch (err) {
        fail(command, messageOf(err));
      }
    });

  return token;
}

async function readAudit(
  command: Cmd,
  filter: AuditFilter,
  rawLimit: string | undefined
) {
  let want = AUDIT_READ_DEFAULT;
  if (rawLimit !== undefined) {
    if (!/^[1-9]\d*$/.test(rawLimit)) {
      return fail(command, '--limit must be a positive whole number');
    }
    want = Number(rawLimit);
  }
  const { ctx } = contextFor(command);
  const items: AuditEvent[] = [];
  const seen = { scope: false, role: false };
  let scope: string | undefined;
  let roleLookup: string | undefined;
  const pageFilter = { ...filter, limit: Math.min(want, AUDIT_PAGE_MAX) };
  for await (const page of iterateAuditEvents(ctx, pageFilter)) {
    items.push(...page.items);
    scope = page.scope;
    roleLookup = page.roleLookup ?? roleLookup;
    printNotices(page.scope, page.roleLookup, seen);
    if (items.length >= want) break;
  }
  const shown = items.slice(0, want);
  if (isJson(command)) {
    printJson({ items: shown, scope, ...(roleLookup ? { roleLookup } : {}) });
    return;
  }
  for (const e of shown) {
    console.log(
      [
        e.ts,
        e.kind,
        e.decision ?? '-',
        e.action ?? '-',
        e.resource ?? '-',
        e.patId ?? '-',
        e.userId ?? '-',
        e.reason ?? '-'
      ].join('\t')
    );
  }
}

async function exportAudit(
  command: Cmd,
  filter: AuditFilter,
  options: { export: string; output?: string; from?: string; to?: string }
) {
  const format = options.export;
  if (format !== 'ndjson' && format !== 'csv') {
    return fail(command, '--export must be ndjson or csv');
  }
  if (!options.from || !options.to) {
    return fail(command, '--from and --to are required for --export');
  }
  const fromMs = Date.parse(options.from);
  const toMs = Date.parse(options.to);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
    return fail(command, '--from and --to must be ISO-8601 timestamps');
  }
  if (fromMs > toMs) {
    return fail(command, '--from must not be after --to');
  }
  const { ctx } = contextFor(command);
  const sink = openSink(options.output);
  const seen = { scope: false, role: false };
  let lastTs: string | undefined;
  let failure: unknown;
  try {
    if (format === 'csv') await sink.write(csvHeader());
    // Newest window first; each window is its own export and its own audit.exported pages.
    for (const window of splitWindows(fromMs, toMs)) {
      let rows = 0;
      let capped = false;
      const pages = iterateAuditEvents(
        ctx,
        { ...filter, ...window, limit: AUDIT_PAGE_MAX },
        { export: true }
      );
      for await (const page of pages) {
        printNotices(page.scope, page.roleLookup, seen);
        const room = MAX_EXPORT_ROWS - rows;
        const take = page.items.slice(0, room);
        let chunk = '';
        for (const event of take) {
          chunk +=
            format === 'csv' ? csvRow(event) : JSON.stringify(event) + '\n';
        }
        if (chunk) await sink.write(chunk);
        rows += take.length;
        if (take.length > 0) lastTs = take[take.length - 1].ts;
        if (
          rows >= MAX_EXPORT_ROWS &&
          (page.next || take.length < page.items.length)
        ) {
          capped = true;
          break;
        }
      }
      if (capped) {
        console.error(
          `Export stopped at the limit of ${MAX_EXPORT_ROWS} events in one window. The last ts written is ${lastTs}. Continue with --to ${lastTs} (events with that exact ts may repeat).`
        );
        break;
      }
    }
  } catch (err) {
    failure = err;
  }
  try {
    await sink.close();
  } catch (err) {
    failure = failure ?? err;
  }
  if (failure) {
    fail(command, messageOf(failure));
  }
}
