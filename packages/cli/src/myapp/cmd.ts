import { Command } from 'commander';
import {
  Context,
  listMyApps,
  createMyApp,
  getMyApp,
  removeMyApp
} from '@osaas/client-core';
import { confirm } from '../user/util';

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
        console.log(`App ${app.name} created successfully.`);
        if (app.appDns) {
          console.log(`DNS: ${app.appDns}`);
        }
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
