import { Context, getInstance, saveSecret } from '@osaas/client-core';
import {
  createEyevinnEncoreCallbackListenerInstance,
  createEyevinnEncorePackagerInstance,
  createValkeyIoValkeyInstance
} from '@osaas/client-services';
import { createVodPipeline } from './vodpipeline';

jest.mock('./util', () => ({ delay: jest.fn().mockResolvedValue(undefined) }));

jest.mock('@osaas/client-core', () => ({
  isValidInstanceName: () => true,
  getInstance: jest.fn(),
  getPortsForInstance: jest
    .fn()
    .mockResolvedValue([
      { internalPort: 6379, externalIp: '1.2.3.4', externalPort: 1234 }
    ]),
  removeInstance: jest.fn(),
  saveSecret: jest.fn().mockResolvedValue(undefined),
  waitForInstanceReady: jest.fn().mockResolvedValue(undefined),
  buildRedisUrl: jest.fn(
    (host: string, port: number, pw: string) =>
      `redis://:${encodeURIComponent(pw)}@${host}:${port}`
  ),
  createValkeyPasswordSecret: jest.fn().mockResolvedValue({
    password: 'pw+/=',
    secretName: 'mypipe',
    secretRef: '{{secrets.mypipe}}'
  })
}));

jest.mock('@osaas/client-services', () => ({
  createEncoreInstance: jest
    .fn()
    .mockResolvedValue({ url: 'https://encore.example' }),
  createEyevinnEncoreCallbackListenerInstance: jest
    .fn()
    .mockResolvedValue({ url: 'https://cb.example' }),
  createEyevinnEncorePackagerInstance: jest
    .fn()
    .mockResolvedValue({ OutputFolder: 's3://out/' }),
  createMinioMinioInstance: jest.fn(),
  createValkeyIoValkeyInstance: jest.fn().mockResolvedValue({ name: 'mypipe' })
}));

jest.mock('minio', () => ({}));

describe('createVodPipeline valkey password', () => {
  const ctx = {
    getServiceAccessToken: jest.fn().mockResolvedValue('sat'),
    getPersonalAccessToken: jest.fn().mockReturnValue('pat')
  } as unknown as Context;

  it('creates Valkey with a generated password secret and passes the URL as secrets', async () => {
    (getInstance as jest.Mock).mockImplementation(
      async (_c: unknown, serviceId: string) =>
        serviceId === 'encore' ? { url: 'https://encore.example' } : undefined
    );

    await createVodPipeline('mypipe', ctx, {
      outputBucketName: 'out',
      accessKeyId: 'ak',
      secretAccessKey: 'sk',
      endpoint: 'https://s3.example'
    });

    expect(createValkeyIoValkeyInstance).toHaveBeenCalledWith(ctx, {
      name: 'mypipe',
      Password: '{{secrets.mypipe}}'
    });
    const fullUrl = 'redis://:pw%2B%2F%3D@1.2.3.4:1234';
    expect(saveSecret).toHaveBeenCalledWith(
      'eyevinn-encore-callback-listener',
      'redisurlmypipe',
      fullUrl,
      ctx
    );
    expect(saveSecret).toHaveBeenCalledWith(
      'eyevinn-encore-packager',
      'redisurlmypipe',
      fullUrl,
      ctx
    );
    expect(createEyevinnEncoreCallbackListenerInstance).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ RedisUrl: '{{secrets.redisurlmypipe}}' })
    );
    expect(createEyevinnEncorePackagerInstance).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ RedisUrl: '{{secrets.redisurlmypipe}}' })
    );
  });
});
