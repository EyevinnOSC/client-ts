import {
  Context,
  Log,
  createFetch,
  createInstance,
  getInstance,
  removeInstance
} from '@osaas/client-core';
import { delay } from './util';

const SERVICE_ID = 'eyevinn-auto-subtitles';

export type TranscribeOutputFormat =
  | 'json'
  | 'text'
  | 'srt'
  | 'verbose_json'
  | 'vtt';

type TranscribeResult = {
  workerId: string;
  result?: string;
  error?: string;
};

/**
 * @memberof module:@osaas/client-transcode
 */
export class SubtitlingPool {
  private context: Context;
  private token?: string;
  private instances: string[];
  private poolSize: number;

  constructor({ context, size }: { context: Context; size?: number }) {
    this.context = context;
    this.instances = [];
    this.poolSize = size || 1;
  }

  public async init({
    openaikey,
    awsAccessKeyId,
    awsSecretAccessKey,
    awsRegion
  }: {
    openaikey: string;
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    awsRegion?: string;
  }) {
    this.token = await this.context.getServiceAccessToken(SERVICE_ID);
    if (this.instances.length > 0) {
      throw new Error('Pool already initialized');
    }
    const names = [];
    for (let i = 0; i < this.poolSize; i++) {
      names.push(`node${i + 1}`);
    }
    for (const name of names) {
      const instance = await getInstance(
        this.context,
        SERVICE_ID,
        name,
        this.token
      );
      if (!instance) {
        Log().debug(`Creating pool instance ${name}`);
        const instance = await createInstance(
          this.context,
          SERVICE_ID,
          this.token,
          {
            name,
            openaikey,
            awsAccessKeyId,
            awsSecretAccessKey,
            awsRegion
          }
        );
        await delay(5000);
        this.instances.push(instance.name);
      } else {
        this.instances.push(instance.name);
      }
    }
  }

  public async destroy() {
    if (!this.token) {
      throw new Error('Pool not initialized');
    }
    for (const instance of this.instances) {
      await removeInstance(this.context, SERVICE_ID, instance, this.token);
    }
  }

  public async transcribe(
    source: URL,
    language: string,
    format: TranscribeOutputFormat
  ) {
    if (!this.token) {
      this.token = await this.context.refreshServiceAccessToken(SERVICE_ID);
    }
    if (this.instances.length == 0) {
      throw new Error('Pool not initialized');
    }
    const name =
      this.instances[Math.floor(Math.random() * this.instances.length)];
    const instance = await getInstance(
      this.context,
      SERVICE_ID,
      name,
      this.token
    );
    const transcribeJobUrl = new URL('/transcribe', instance.url);
    Log().debug(language, format);
    const data = await createFetch<TranscribeResult>(transcribeJobUrl, {
      method: 'POST',
      body: JSON.stringify({
        url: source.toString(),
        language,
        format
      }),
      headers: {
        'x-jwt': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    if (data.error) {
      throw new Error(data.error);
    }
    return data.result;
  }
}
