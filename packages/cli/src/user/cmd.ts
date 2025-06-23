import {
  Context,
  createFetch,
  createInstance,
  getInstance,
  getLogsForInstance,
  getPortsForInstance,
  listInstances,
  listReservedNodes,
  removeInstance
} from '@osaas/client-core';
import { Command } from 'commander';
import { confirm, instanceOptsToPayload } from './util';
import { restartInstance } from '@osaas/client-core/lib/core';

export function cmdList() {
  const list = new Command('list');

  list
    .description('List all my service instances')
    .argument('<serviceId>', 'The Service Id')
    .action(async (serviceId, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);

        const instances = await listInstances(
          ctx,
          serviceId,
          serviceAccessToken
        );
        return instances.map((instance: { name: string }) =>
          console.log(instance.name)
        );
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return list;
}

export function cmdCreate() {
  const create = new Command('create');

  create
    .description('Create a service instance')
    .argument('<serviceId>', 'The Service Id')
    .argument('<name>', 'The instance name')
    .option(
      '-o, --instance-options [instanceOptions...]',
      'Instance options as key value pairs (e.g. -o key1=value1 -o key2=value2)'
    )
    .action(async (serviceId, name, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const payload = instanceOptsToPayload(options.instanceOptions);
        payload['name'] = name;
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);

        const instance = await createInstance(
          ctx,
          serviceId,
          serviceAccessToken,
          payload
        );
        console.log('Instance created:');
        console.log(instance);
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return create;
}

export function cmdDescribe() {
  const describe = new Command('describe');

  describe
    .description('Get details for a service instance')
    .argument('<serviceId>', 'The Service Id')
    .argument('<name>', 'The instance name')
    .action(async (serviceId, name, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);

        const instance = await getInstance(
          ctx,
          serviceId,
          name,
          serviceAccessToken
        );
        delete instance['resources'];
        Object.keys(instance).forEach((key) => {
          console.log(`${key}: ${instance[key]}`);
        });
        try {
          const ports = await getPortsForInstance(
            ctx,
            serviceId,
            name,
            serviceAccessToken
          );
          ports.forEach((port) => {
            console.log(
              `${port.externalIp}:${port.externalPort} => ${port.internalPort}`
            );
          });
        } catch (err) {
          // No ports for this service
        }
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return describe;
}

export function cmdRemove() {
  const remove = new Command('remove');

  remove
    .description('Remove a service instance')
    .argument('<serviceId>', 'The Service Id')
    .argument('<name>', 'The instance name')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (serviceId, name, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);

        if (!options.yes) {
          await confirm(`Are you sure you want to remove ${name}? (yes/no) `);
        }
        await removeInstance(ctx, serviceId, name, serviceAccessToken);
        console.log('Instance removed');
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return remove;
}

export function cmdRestart() {
  const restart = new Command('restart');

  restart
    .description('Restart a service instance')
    .argument('<serviceId>', 'The Service Id')
    .argument('<name>', 'The instance name')
    .action(async (serviceId, name, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);

        const instance = await getInstance(
          ctx,
          serviceId,
          name,
          serviceAccessToken
        );
        if (!instance) {
          throw new Error(`Instance ${name} of service ${serviceId} not found`);
        }
        await restartInstance(ctx, serviceId, name, serviceAccessToken);
        console.log(`Instance ${name} of service ${serviceId} restarted`);
      } catch (err) {
        console.log('Error restarting instance:');
        console.log((err as Error).message);
      }
    });
  return restart;
}

export function cmdLogs() {
  const logs = new Command('logs');

  logs
    .description('Get logs for a service instance')
    .argument('<serviceId>', 'The Service Id')
    .argument('<name>', 'The instance name')
    .action(async (serviceId, name, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);

        const logs = await getLogsForInstance(
          ctx,
          serviceId,
          name,
          serviceAccessToken
        );
        console.log(logs);
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return logs;
}

export function cmdReservedNodes() {
  const reservedNodes = new Command('list-reserved-nodes');
  reservedNodes
    .description('List all my reserved nodes')
    .action(async (options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });

        const reservedNodes = await listReservedNodes(ctx);
        reservedNodes.forEach((node) => {
          console.log(`${node.name}:`);
          console.log(`  Purposes: ${node.purposes.join(', ')}`);
          console.log(`  Public IPs: ${node.publicIps.join(', ')}`);
          console.log(`  CPU: ${node.capacity.cpu}`);
          console.log(`  Memory: ${node.capacity.memory}`);
          console.log(`  Storage: ${node.capacity.storage}`);
          console.log(`  Reservations: ${node.reservations.join(', ')}`);
        });
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return reservedNodes;
}

export function cmdServiceAccessToken() {
  const serviceAccessToken = new Command('service-access-token');

  serviceAccessToken
    .description('Generate a service access token for a service')
    .argument('<serviceId>', 'The Service Id')
    .action(async (serviceId, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const serviceAccessToken = await ctx.getServiceAccessToken(serviceId);
        console.log(serviceAccessToken);
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return serviceAccessToken;
}

export function cmdSecrets() {
  const secrets = new Command('secrets');

  secrets
    .command('list')
    .description('List all secrets for a service')
    .argument('<serviceId>', 'The Service Id')
    .action(async (serviceId, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const personalAccessToken = await ctx.getPersonalAccessToken();
        const secrets = await createFetch<
          { serviceId: string; secretName: string }[]
        >(
          new URL(
            '/mysecrets/' + serviceId,
            `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`
          ),
          {
            headers: {
              'x-pat-jwt': `Bearer ${personalAccessToken}`
            }
          }
        );
        secrets.forEach((secret) => {
          console.log(`${secret.secretName}: ***`);
        });
      } catch (err) {
        console.log((err as Error).message);
      }
    });

  secrets
    .command('create')
    .description('Create a new secret for a service')
    .argument('<serviceId>', 'The Service Id')
    .argument('<secretName>', 'The secret name')
    .argument('<secretValue>', 'The secret value')
    .action(async (serviceId, secretName, secretValue, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const personalAccessToken = await ctx.getPersonalAccessToken();
        const secretUrl = new URL(
          '/mysecrets/' + serviceId,
          `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`
        );
        await createFetch(secretUrl, {
          method: 'POST',
          headers: {
            'x-pat-jwt': `Bearer ${personalAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ secretName, secretData: secretValue })
        });
        console.log(`Secret ${secretName} created successfully.`);
      } catch (err) {
        console.log((err as Error).message);
      }
    });

  secrets
    .command('update')
    .description('Update an existing secret for a service')
    .argument('<serviceId>', 'The Service Id')
    .argument('<secretName>', 'The secret name')
    .argument('<secretValue>', 'The secret value')
    .action(async (serviceId, secretName, secretValue, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const personalAccessToken = await ctx.getPersonalAccessToken();
        const secretUrl = new URL(
          '/mysecrets/' + serviceId + `/${secretName}`,
          `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`
        );
        await createFetch(secretUrl, {
          method: 'PUT',
          headers: {
            'x-pat-jwt': `Bearer ${personalAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ secretData: secretValue })
        });
        console.log(`Secret ${secretName} updated successfully.`);
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  secrets
    .command('remove')
    .description('Remove a secret for a service')
    .argument('<serviceId>', 'The Service Id')
    .argument('<secretName>', 'The secret name')
    .action(async (serviceId, secretName, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const ctx = new Context({ environment });
        const personalAccessToken = await ctx.getPersonalAccessToken();
        const secretUrl = new URL(
          '/mysecrets/' + serviceId + `/${secretName}`,
          `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`
        );
        await createFetch(secretUrl, {
          method: 'DELETE',
          headers: {
            'x-pat-jwt': `Bearer ${personalAccessToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Secret ${secretName} removed successfully.`);
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return secrets;
}
