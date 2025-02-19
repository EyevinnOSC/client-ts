import { Context, getInstance } from '@osaas/client-core';
import { createCloudfrontDistribution, publish } from '@osaas/client-web';
import { Command } from 'commander';

interface ConfigList {
  offset: number;
  limit: number;
  total: number;
  items: [{ key: string; value: string }];
}

export function cmdWeb() {
  const web = new Command('web');

  web
    .command('publish')
    .description('Publish a website')
    .argument('<name>', 'Name of website')
    .argument('<dir>', 'Directory to publish')
    .option('-s, --sync', 'Synchronize the bucket')
    .action(async (name, dir, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });

        const website = await publish(name, dir, ctx, { sync: options.sync });
        console.log(`Website published at: ${website.url}`);
        console.log('CDN settings:');
        console.log(` - Origin: ${new URL(website.bucket.endpoint).hostname}`);
        console.log(
          ` - Origin Headers: 'Host: ${
            new URL(website.bucket.endpoint).hostname
          }'`
        );
        console.log(` - Origin Path: ${website.bucket.name}`);
        console.log(` - Default root object: index.html`);
      } catch (err) {
        console.log((err as Error).message);
      }
    });

  web
    .command('cdn-create')
    .description('Create a CDN distribution for a service instance')
    .argument('<serviceId>', 'Service Id')
    .argument('<instanceName>', 'Instance name')
    .option('--provider <provider>', 'CDN provider (default: cloudfront)')
    .option('--origin-path <originPath>', 'Origin path (default: /)')
    .action(async (serviceId, instanceName, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });

        if (!options.provider) {
          options.provider = 'cloudfront';
        }
        if (options.provider === 'cloudfront') {
          console.log('Creating CloudFront distribution...');
          await createCloudfrontDistribution(serviceId, instanceName, ctx, {
            originPath: options.originPath
          });
          console.log('CloudFront distribution created');
        } else {
          console.log('CDN provider not supported (available: cloudfront)');
        }
      } catch (err) {
        console.log((err as Error).message);
      }
    });

  web
    .command('config-to-env')
    .description(
      'Load configuration from Application Config service and set as environment variables'
    )
    .argument(
      '<configInstance>',
      'Name of the application configuration service instance'
    )
    .action(async (configInstance, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const token = await ctx.getServiceAccessToken('eyevinn-app-config-svc');
        const instance = await getInstance(
          ctx,
          'eyevinn-app-config-svc',
          configInstance,
          token
        );
        if (instance) {
          const url = new URL('/api/v1/config', instance.url);
          const response = await fetch(url);
          if (response.ok) {
            const data: ConfigList = (await response.json()) as ConfigList;
            data.items.map((config) => {
              console.log(`export ${config.key.toUpperCase()}=${config.value}`);
            });
          }
        }
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return web;
}
