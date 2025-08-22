import { Command } from 'commander';
import { generatePat } from './token';
import {
  Log,
  Platform,
  getOrderIdByName,
  remakeOrder,
  waitForOrder
} from '@osaas/client-core';
import { listInstancesForTenant, removeInstanceForTenant } from './instance';
import { confirm } from '../user/util';
import {
  listSubscriptionsForTenant,
  removeSubscriptionForTenant
} from './subscription';

export default function cmdAdmin() {
  const admin = new Command('admin');
  admin
    .command('gen-pat')
    .description('Generate a personal access token')
    .argument('<tenantId>', 'The tenant ID')
    .argument('<username>', 'The username')
    .action((tenantId, username) => {
      try {
        const pat = generatePat(tenantId, username);
        console.log(pat);
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  admin
    .command('list-instances')
    .description('List all instances for a service and tenant')
    .argument('<tenantId>', 'The tenant ID')
    .argument('<serviceId>', 'The service ID')
    .action(async (tenantId, serviceId, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        Log().info(
          `Listing instance for tenant ${tenantId} and service ${serviceId} in ${environment}`
        );
        const instances = await listInstancesForTenant(
          tenantId,
          serviceId,
          environment
        );
        instances.forEach((instance) => console.log(instance));
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  admin
    .command('remove-instance')
    .description('Remove an instance')
    .argument('<tenantId>', 'The Tenant Id')
    .argument('<serviceId>', 'The Service Id')
    .argument('<name>', 'The instance name')
    .action(async (tenantId, serviceId, name, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        Log().info(
          `Removing instance ${name} for tenant ${tenantId} and service ${serviceId} in ${environment}`
        );
        await confirm(
          'Are you sure you want to remove this instance? (yes/no) '
        );
        await removeInstanceForTenant(tenantId, serviceId, name, environment);
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  admin
    .command('remove-all-instances')
    .argument('<tenantId>', 'The Tenant Id')
    .action(async (tenantId, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const services = await listSubscriptionsForTenant(
          tenantId,
          environment
        );
        const instancesToRemove: { serviceId: string; instance: string }[] = [];
        for (const serviceId of services) {
          const instances = await listInstancesForTenant(
            tenantId,
            serviceId,
            environment
          );
          instances.forEach((instance) => {
            instancesToRemove.push({ serviceId, instance });
          });
        }
        if (instancesToRemove.length === 0) {
          Log().info(
            `No instances found for tenant ${tenantId} in ${environment}`
          );
          console.log('Tenant has no instances');
          return;
        }
        instancesToRemove.map((item) =>
          console.log(` - ${item.serviceId}: ${item.instance}`)
        );
        await confirm(
          'Are you really sure you want to remove all above instances for tenant ' +
            `${tenantId} in ${environment}? (yes/no) `
        );
        for (const item of instancesToRemove) {
          await removeInstanceForTenant(
            tenantId,
            item.serviceId,
            item.instance,
            environment
          );
        }
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  admin
    .command('list-subscriptions')
    .description('List all subscriptions for a tenant')
    .argument('<tenantId>', 'The tenant ID')
    .action(async (tenantId, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        Log().info(
          `Listing subscriptions for tenant ${tenantId} in ${environment}`
        );
        const subscriptions = await listSubscriptionsForTenant(
          tenantId,
          environment
        );
        subscriptions.forEach((subscription) => console.log(subscription));
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  admin
    .command('remove-subscription')
    .description('Remove a subscription for a tenant')
    .argument('<tenantId>', 'The Tenant Id')
    .argument('<serviceId>', 'The Service Id')
    .action(async (tenantId, serviceId, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        Log().info(
          `Removing ${serviceId} subscription for tenant ${tenantId} in ${environment}`
        );
        const subscriptions = await listSubscriptionsForTenant(
          tenantId,
          environment
        );
        if (subscriptions.includes(serviceId)) {
          await confirm(
            `Are you sure you want to remove the subscription for service ${serviceId}? (yes/no) `
          );
          await removeSubscriptionForTenant(tenantId, serviceId, environment);
        }
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  admin
    .command('remake-order')
    .description('Remake an order')
    .option('-y, --yes', 'Skip confirmation')
    .option('-w, --wait', 'Wait for the order to complete')
    .argument('<orderName>', 'The name of the order to remake')
    .action(async (orderName, options, command) => {
      try {
        const globalOpts = command.optsWithGlobals();
        const environment = globalOpts?.env || 'prod';
        const platform = new Platform({ environment });

        Log().info(`Remaking order ${orderName} in ${environment}`);
        const orderId = await getOrderIdByName(platform, orderName);
        if (orderId) {
          if (!options.yes) {
            await confirm(
              `Are you sure you want to remake the order '${orderName}'? (yes/no) `
            );
          }
          const newOrderId = await remakeOrder(platform, orderId);
          if (newOrderId) {
            if (options.wait) {
              Log().info(`Waiting for order ${orderName} to complete...`);
              await waitForOrder(platform, newOrderId);
              Log().info(`Order ${orderName} has been remade successfully`);
            }
          } else {
            Log().error(`Failed to remake order ${orderName}`);
          }
        } else {
          Log().info(`Order ${orderName} not found`);
        }
      } catch (err) {
        console.log((err as Error).message);
      }
    });
  return admin;
}
