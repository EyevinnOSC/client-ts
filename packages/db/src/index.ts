/** @module @osaas/client-db */

import { Context, getPortsForInstance } from '@osaas/client-core';
import {
  ApacheCouchdbConfig,
  BirmeOscPostgresqlConfig,
  ClickhouseClickhouseConfig,
  createApacheCouchdbInstance,
  createBirmeOscPostgresqlInstance,
  createClickhouseClickhouseInstance,
  createLinuxserverDockerMariadbInstance,
  createValkeyIoValkeyInstance,
  getApacheCouchdbInstance,
  getBirmeOscPostgresqlInstance,
  getClickhouseClickhouseInstance,
  getLinuxserverDockerMariadbInstance,
  getValkeyIoValkeyInstance,
  LinuxserverDockerMariadbConfig,
  ValkeyIoValkeyConfig
} from '@osaas/client-services';

export { ValkeyDb } from './valkey';

export type DatabaseType =
  | 'valkey'
  | 'postgres'
  | 'mariadb'
  | 'clickhouse'
  | 'couchdb';

export const DatabaseTypeToServiceId: Record<DatabaseType, string> = {
  valkey: 'valkey-io-valkey',
  postgres: 'birme-osc-postgresql',
  mariadb: 'linuxserver-docker-mariadb',
  clickhouse: 'clickhouse-clickhouse',
  couchdb: 'apache-couchdb'
};
export const DatabaseTypeToPort: Record<DatabaseType, number> = {
  valkey: 6379,
  postgres: 5432,
  mariadb: 3306,
  clickhouse: 9000,
  couchdb: 5984
};
export const DatabaseTypeToProtocol: Record<DatabaseType, string> = {
  valkey: 'redis',
  postgres: 'postgres',
  mariadb: 'mysql',
  clickhouse: 'clickhouse',
  couchdb: 'https'
};

export interface DatabaseOpts {
  username?: string;
  password?: string;
  rootPassword?: string;
  database?: string;
}

/**
 * @typedef {object} DatabaseOpts
 * @property {string} [username] - The username for the database
 * @property {string} [password] - The password for the database
 * @property {string} [rootPassword] - The root password for the database
 * @property {string} [database] - The database name
 */

/**
 * Create a database instance if it does not exists
 * and return the connection URL.
 *
 * @param {Context} ctx The Open Source Cloud configuration context.
 * @param {DatabaseType} type The type of the database.
 * @param {string} name The name of the database instance.
 * @param {DatabaseOpts} opts The options for the database.
 * @returns The connection URL for the database.
 *
 * @example
 * import { Context } from '@osaas/client-core';
 * import { setupDatabase } from '@osaas/client-db';
 * import Redis from 'ioredis';
 *
 * const ctx = new Context();
 * const dbUrl = await setupDatabase(ctx, 'valkey', 'myvalkey', { password: 'secret' });
 * const client = new Redis(dbUrl);
 * try {
 *   await client.subscribe('messages');
 *   console.log('Waiting for messages...');
 *   client.on('message', (channel, message) => {
 *     console.log(`Received message: ${message} from ${channel}`);
 *   });
 * } catch (err) {
 *   console.error('Error:', err);
 * }
 */
export async function setupDatabase(
  ctx: Context,
  type: DatabaseType,
  name: string,
  opts: DatabaseOpts
) {
  let instance;

  switch (type) {
    case 'valkey':
      instance = await getValkeyIoValkeyInstance(ctx, name);
      break;
    case 'postgres':
      instance = await getBirmeOscPostgresqlInstance(ctx, name);
      break;
    case 'mariadb':
      instance = await getLinuxserverDockerMariadbInstance(ctx, name);
      break;
    case 'clickhouse':
      instance = await getClickhouseClickhouseInstance(ctx, name);
      break;
    case 'couchdb':
      instance = await getApacheCouchdbInstance(ctx, name);
      break;
    default:
      throw new Error(`Unsupported database type: ${type}`);
  }
  if (!instance) {
    switch (type) {
      case 'valkey':
        {
          const options: ValkeyIoValkeyConfig = {
            name,
            Password: opts.password
          };
          instance = await createValkeyIoValkeyInstance(ctx, options);
        }
        break;
      case 'postgres':
        {
          if (!opts.password) {
            throw new Error('Password is required for postgres');
          }
          const options: BirmeOscPostgresqlConfig = {
            name,
            PostgresUser: opts.username,
            PostgresPassword: opts.password,
            PostgresDb: opts.database
          };
          instance = await createBirmeOscPostgresqlInstance(ctx, options);
        }
        break;
      case 'mariadb':
        {
          if (!opts.rootPassword) {
            throw new Error('Root password is required for mariadb');
          }
          const options: LinuxserverDockerMariadbConfig = {
            name,
            RootPassword: opts.rootPassword,
            Database: opts.database,
            User: opts.username,
            Password: opts.password
          };
          instance = await createLinuxserverDockerMariadbInstance(ctx, options);
        }
        break;
      case 'clickhouse':
        {
          const options: ClickhouseClickhouseConfig = {
            name,
            Password: opts.password,
            User: opts.username,
            Db: opts.database
          };
          instance = await createClickhouseClickhouseInstance(ctx, options);
        }
        break;
      case 'couchdb':
        {
          if (!opts.rootPassword) {
            throw new Error('Root password is required for couchdb');
          }
          const options: ApacheCouchdbConfig = {
            name,
            AdminPassword: opts.rootPassword
          };
          instance = await createApacheCouchdbInstance(ctx, options);
        }
        break;
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  switch (type) {
    case 'valkey':
    case 'postgres':
    case 'mariadb': {
      const token = await ctx.getServiceAccessToken(
        DatabaseTypeToServiceId[type]
      );
      const ports = await getPortsForInstance(
        ctx,
        DatabaseTypeToServiceId[type],
        name,
        token
      );
      const port = ports.find(
        (p) => p.internalPort === DatabaseTypeToPort[type]
      );
      if (port) {
        return `${DatabaseTypeToProtocol[type]}://${
          opts.username || 'default'
        }${opts.password ? ':' + opts.password : ''}@${port.externalIp}:${
          port.externalPort
        }`;
      }
      throw new Error('Failed to get connection URL for database');
    }
    case 'couchdb': {
      const url = new URL(instance.url);
      url.password = (instance as any).AdminPassword;
      url.username = 'admin';
      return url.toString();
    }
    case 'clickhouse': {
      const url = new URL(instance.url);
      url.username = opts.username || 'default';
      url.password = opts.password || '';
      return url.toString();
    }
    default:
      throw new Error(`Unsupported database type: ${type}`);
  }
}
