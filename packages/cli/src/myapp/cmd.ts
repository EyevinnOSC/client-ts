import { Command } from 'commander';
import {
  Context,
  listMyApps,
  createMyApp,
  getMyApp,
  removeMyApp
} from '@osaas/client-core';
import { confirm } from '../user/util';

async function waitForAppReady(
  ctx: Context,
  appId: string,
  timeoutMs = 5 * 60 * 1000,
  intervalMs = 5000
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  process.stdout.write('Waiting for app to be ready');
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, intervalMs));
    process.stdout.write('.');
    const app = await getMyApp(ctx, appId);
    if (app.buildStatus === 'running') {
      process.stdout.write('\n');
      console.log(`App is ready.`);
      if (app.url) console.log(`URL:    ${app.url}`);
      if (app.appDns) console.log(`DNS:    ${app.appDns}`);
      return;
    }
    if (app.buildStatus === 'failed') {
      process.stdout.write('\n');
      throw new Error(
        `App build failed. Check logs with: osc myapp describe ${appId}`
      );
    }
  }
  process.stdout.write('\n');
  console.log(
    `Timed out waiting for app readiness. Use 'osc myapp describe ${appId}' to check status.`
  );
}

export function cmdMyapp() {
  const myapp = new Command('myapp');

  myapp
    .command('list')
    .description('List all my apps')
    .action(async (options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const apps = await listMyApps(ctx);
        apps.forEach((app) => {
          console.log(`${app.name} (${app.type}): ${app.url || 'no url yet'}`);
        });
      } catch (err) {
        console.log((err as Error).message);
      }
    });

  myapp
    .command('create')
    .description('Create a new app')
    .argument('<name>', 'App name')
    .argument('<type>', 'App type (nodejs or python)')
    .argument('<gitHubUrl>', 'GitHub repository URL')
    .option('--github-token <token>', 'GitHub token for private repos')
    .option('--config-service <name>', 'Config service reference')
    .option('--no-wait', 'Do not wait for app to become ready')
    .action(async (name, type, gitHubUrl, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const app = await createMyApp(ctx, {
          name,
          type,
          gitHubUrl,
          gitHubToken: options.githubToken,
          configService: options.configService
        });
        console.log(`App ${app.name} creation started...`);
        if (!options.wait) {
          console.log(`Build status: ${app.buildStatus ?? 'unknown'}`);
          return;
        }
        await waitForAppReady(ctx, app.id);
      } catch (err) {
        console.log((err as Error).message);
      }
    });

  myapp
    .command('describe')
    .description('Show app details')
    .argument('<appId>', 'App ID')
    .action(async (appId, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const app = await getMyApp(ctx, appId);
        console.log(JSON.stringify(app, null, 2));
      } catch (err) {
        console.log((err as Error).message);
      }
    });

  myapp
    .command('remove')
    .description('Remove an app')
    .argument('<appId>', 'App ID')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (appId, options, command) => {
      try {
        if (!options.yes) {
          await confirm(
            `Are you sure you want to remove app ${appId}? (yes/no) `
          );
        }
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        await removeMyApp(ctx, appId);
        console.log(`App ${appId} removed successfully.`);
      } catch (err) {
        console.log((err as Error).message);
      }
    });

  return myapp;
}
