import {
  Context,
  createInstance,
  getInstance,
  getPortsForInstance,
  removeInstance,
  waitForInstanceReady
} from '@osaas/client-core';
import {
  createCloudfrontDistribution,
  publish,
  publishToMyPages
} from '@osaas/client-web';
import { Command } from 'commander';

interface ConfigItem {
  key: string;
  value: string;
  secret?: boolean;
}

interface ConfigList {
  offset: number;
  limit: number;
  total: number;
  items: ConfigItem[];
}

export function cmdWeb() {
  const web = new Command('web');

  web
    .command('publish')
    .description('Publish a website')
    .argument('<name>', 'Name of website')
    .argument('<dir>', 'Directory to publish')
    .option('-s, --sync', 'Synchronize the bucket (minio backend only)')
    .option(
      '--backend <backend>',
      "Publish backend to use: 'minio' (default) or 'mypages'"
    )
    .action(async (name, dir, options, command) => {
      const backend = options.backend || 'minio';
      if (backend !== 'minio' && backend !== 'mypages') {
        console.log(
          `Unknown --backend '${backend}'. Supported values: minio, mypages`
        );
        return;
      }

      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });

        if (backend === 'mypages') {
          const page = await publishToMyPages(name, dir, ctx);
          console.log(`Website published at: ${page.url}`);
          console.log(
            'Note: the mypages backend does not provision a dedicated ' +
              "storage bucket, so 'osc web cdn-create' cannot be pointed at " +
              'it the way it can for the default minio backend. Custom ' +
              'domains/CDN in front of a mypages site are not yet supported ' +
              '(see Eyevinn/osaas-deploy-manager#1409).'
          );
          return;
        }

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
    .command('config-create')
    .description('Create a configuration service instance')
    .argument('<name>', 'Name of the configuration service instance')
    .action(async (name, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const configToken = await ctx.getServiceAccessToken(
          'eyevinn-app-config-svc'
        );
        let configInstance = await getInstance(
          ctx,
          'eyevinn-app-config-svc',
          name,
          configToken
        );
        if (!configInstance) {
          const valkeyToken = await ctx.getServiceAccessToken(
            'valkey-io-valkey'
          );
          let valkeyInstance = await getInstance(
            ctx,
            'valkey-io-valkey',
            name,
            valkeyToken
          );
          if (!valkeyInstance) {
            valkeyInstance = await createInstance(
              ctx,
              'valkey-io-valkey',
              valkeyToken,
              {
                name
              }
            );
            await waitForInstanceReady('valkey-io-valkey', name, ctx);
          }
          const ports = await getPortsForInstance(
            ctx,
            'valkey-io-valkey',
            name,
            valkeyToken
          );
          const redisPort = ports.find((port) => port.internalPort == 6379);
          if (!redisPort) {
            throw new Error(`Failed to get redis port for instance ${name}`);
          }
          configInstance = await createInstance(
            ctx,
            'eyevinn-app-config-svc',
            configToken,
            {
              name,
              RedisUrl: `redis://${redisPort.externalIp}:${redisPort.externalPort}`
            }
          );
          await waitForInstanceReady('eyevinn-app-config-svc', name, ctx);
        }
        console.log(
          `Configuration service instance available at ${configInstance.url}`
        );
      } catch (err) {
        console.log((err as Error).message);
      }
    });

  web
    .command('config-delete')
    .description('Delete a configuration service instance')
    .argument('<name>', 'Name of the configuration service instance')
    .option('--data', 'Delete config data')
    .action(async (name, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const configToken = await ctx.getServiceAccessToken(
          'eyevinn-app-config-svc'
        );
        const configInstance = await getInstance(
          ctx,
          'eyevinn-app-config-svc',
          name,
          configToken
        );
        if (configInstance) {
          await removeInstance(
            ctx,
            'eyevinn-app-config-svc',
            name,
            configToken
          );
          if (options.data) {
            console.log('Deleting config data...');
            const valkeyToken = await ctx.getServiceAccessToken(
              'valkey-io-valkey'
            );
            await removeInstance(ctx, 'valkey-io-valkey', name, valkeyToken);
          }
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
    .option(
      '--config-api-key <key>',
      'API key for accessing secret parameters (or set CONFIG_API_KEY env var)'
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
          const configApiKey =
            options.configApiKey || process.env.CONFIG_API_KEY;
          // Always send the service access token (satisfies the OSC token wall).
          // Additionally send x-config-api-key when available — the config service
          // uses this dedicated header to authorize secret parameter decryption.
          const fetchHeaders: Record<string, string> = {
            Authorization: `Bearer ${token}`
          };
          if (configApiKey) {
            fetchHeaders['x-config-api-key'] = configApiKey;
          }

          const pageLimit = 100;
          let cursor = 0;
          const allItems: ConfigItem[] = [];

          do {
            const url = new URL('/api/v1/config', instance.url);
            url.searchParams.set('limit', String(pageLimit));
            url.searchParams.set('offset', String(cursor));

            const response = await fetch(url, { headers: fetchHeaders });
            if (!response.ok) {
              throw new Error(
                `Failed to load config from '${configInstance}': HTTP ${response.status}`
              );
            }
            const page: ConfigList = (await response.json()) as ConfigList;
            allItems.push(...page.items);
            cursor = page.offset;
          } while (cursor !== 0);

          allItems.map((config) => {
            // Single-quote values to prevent shell expansion of special characters.
            // The `secret` field is intentionally not emitted — only the resolved
            // value (or *** if undecrypted) is written to the shell output.
            const escaped = config.value.replace(/'/g, "'\\''");
            console.log(`export ${config.key.toUpperCase()}='${escaped}'`);
          });
        } else {
          throw new Error(
            `Config service instance '${configInstance}' not found`
          );
        }
      } catch (err) {
        console.error((err as Error).message);
        process.exit(1);
      }
    });
  return web;
}
