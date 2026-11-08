import {
  Context,
  Log,
  buildRedisUrl,
  GeneratedValkeyPassword,
  createValkeyPasswordSecret,
  getPortsForInstance,
  listInstances
} from '@osaas/client-core';
import {
  createValkeyIoValkeyInstance,
  getValkeyIoValkeyInstance,
  removeValkeyIoValkeyInstance
} from '@osaas/client-services';

const SERVICE_ID = 'valkey-io-valkey';

export class ValkeyDb {
  private context: Context;
  private name: string;
  private url?: URL;

  constructor({ context, name }: { context: Context; name: string }) {
    this.context = context;
    this.name = name;
  }

  public static async list(ctx: Context): Promise<ValkeyDb[]> {
    const token = await ctx.getServiceAccessToken(SERVICE_ID);
    const instances = await listInstances(ctx, SERVICE_ID, token);
    return instances.map((instance: { name: string }) => {
      return new ValkeyDb({ context: ctx, name: instance.name });
    });
  }

  private async getRedisPort() {
    const token = await this.context.getServiceAccessToken(SERVICE_ID);
    const ports = await getPortsForInstance(
      this.context,
      SERVICE_ID,
      this.name,
      token
    );
    const redisPort = ports.find((port) => port.internalPort == 6379);
    return redisPort;
  }

  public async init() {
    const instance = await getValkeyIoValkeyInstance(this.context, this.name);
    let generated: GeneratedValkeyPassword | undefined;
    if (!instance) {
      generated = await createValkeyPasswordSecret(this.context, this.name);
      await createValkeyIoValkeyInstance(this.context, {
        name: this.name,
        Password: generated.secretRef
      });
    }
    const redisPort = await this.getRedisPort();
    if (redisPort) {
      this.url = new URL(
        generated
          ? buildRedisUrl(
              redisPort.externalIp,
              redisPort.externalPort,
              generated.password
            )
          : `redis://${redisPort.externalIp}:${redisPort.externalPort}`
      );
    }
  }

  public async destroy() {
    try {
      await removeValkeyIoValkeyInstance(this.context, this.name);
    } catch (err) {
      Log().error((err as Error).message);
    }
  }

  public async getRedisUrl(): Promise<URL | undefined> {
    if (!this.url) {
      await this.init();
    }
    return this.url;
  }

  public getName(): string {
    return this.name;
  }
}
