import {
  Context,
  Log,
  createFetch,
  createInstance,
  getInstance,
  removeInstance
} from '@osaas/client-core';
import { ValkeyDb } from '@osaas/client-db';
import { delay, transferFile, waitForEncoreJobToComplete } from './util';
import { EncoreCallbackListener, EncorePackager, FileOutput } from './encore';
import path from 'node:path';
import { createStreamingPackage } from './packager';

export type PoolTranscodeOptions = {
  profile?: string;
  duration?: number;
  packageDestination?: URL;
};

export type QueuePoolOptions = {
  context: Context;
  size?: number;
  usePackagingQueue?: boolean;
  packageDestination?: URL;
};

/**
 * Represents a pool of Encore queues (instances) in Open Source Cloud
 * @memberof module:@osaas/client-transcode
 */
export class QueuePool {
  private context: Context;
  private token?: string;
  private instances: string[];
  private queueSize: number;
  private redisPackagingQueue?: ValkeyDb;
  private encoreCallbacks: { [name: string]: EncoreCallbackListener };
  private packageDestination?: URL;
  private encorePackager?: EncorePackager;

  /**
   * @typedef QueuePoolOptions
   * @type object
   * @property {Context} context - Open Source Cloud configuration context
   * @property {number} size - Number of queues in the pool
   * @property {boolean?} usePackagingQueue - If true, use a packaging queue (default: false)
   */

  /**
   * @typedef PoolTranscodeOptions
   * @type object
   * @property {string?} profile - Transcoding profile to use (default: program)
   * @property {number?} duration - Duration in seconds (default: entire file)
   * @property {URL?} packageDestination - If provided create a streaming package and store here
   */

  /**
   * Creates a new Queue Pool
   * @constructor
   * @param {QueuePoolOptions} options - Queue Pool options
   * @example
   * import { Context } from '@osaas/client-core';
   * import { QueuePool } from '@osaas/client-transcode';
   * const ctx = new Context();
   * // Create a new pool with 2 queues
   * const pool = new QueuePool({ context: ctx, size: 2 });
   * await pool.init();
   */
  constructor({
    context,
    size,
    usePackagingQueue,
    packageDestination
  }: QueuePoolOptions) {
    this.context = context;
    this.instances = [];
    this.queueSize = size || 1;
    if (usePackagingQueue) {
      this.redisPackagingQueue = new ValkeyDb({
        context,
        name: 'packaging'
      });
      this.packageDestination = packageDestination;
    }
    this.encoreCallbacks = {};
  }

  /**
   * Initializes the pool by creating the queues
   * @async
   * @example
   * await pool.init();
   */
  public async init() {
    let redisUrl: URL | undefined = undefined;
    if (this.redisPackagingQueue) {
      redisUrl = await this.redisPackagingQueue.getRedisUrl();
      if (!redisUrl) {
        throw new Error('Failed to get Redis URL');
      }
    }

    this.token = await this.context.getServiceAccessToken('encore');

    if (this.instances.length > 0) {
      throw new Error('Pool already initialized');
    }
    const names = [];
    for (let i = 0; i < this.queueSize; i++) {
      names.push(`node${i + 1}`);
    }
    for (const name of names) {
      let instance = await getInstance(
        this.context,
        'encore',
        name,
        this.token
      );
      if (!instance) {
        Log().debug(`Creating pool instance ${name}`);
        instance = await createInstance(this.context, 'encore', this.token, {
          name
        });
        await delay(5000);
        this.instances.push(instance.name);
      } else {
        this.instances.push(instance.name);
      }
      if (redisUrl) {
        const callback = new EncoreCallbackListener({
          context: this.context,
          name,
          redisUrl: redisUrl.toString(),
          encoreUrl: instance.url.replace(/\/$/, '')
        });
        Log().debug(`Creating callback listener for ${name}`);
        await callback.init();
        this.encoreCallbacks[name] = callback;
      }
    }
    if (redisUrl && this.packageDestination) {
      this.encorePackager = new EncorePackager({
        context: this.context,
        name: 'packager',
        redisUrl: redisUrl.toString(),
        outputFolder: this.packageDestination.toString()
      });
      await this.encorePackager.init();
    }
  }

  /**
   * Destroys the pool by removing the queues
   * @async
   * @example
   * await pool.destroy();
   */
  public async destroy() {
    if (!this.token) {
      this.token = await this.context.getServiceAccessToken('encore');
    }
    for (const instance of this.instances) {
      await removeInstance(this.context, 'encore', instance, this.token);
      if (this.encoreCallbacks[instance]) {
        await this.encoreCallbacks[instance].destroy();
      }
    }
    if (this.encorePackager) {
      await this.encorePackager.destroy();
    }
    if (this.redisPackagingQueue) {
      await this.redisPackagingQueue.destroy();
    }
  }

  /**
   * Transcodes a media file into an ABR bundle that is transferred to a destination
   * @async
   * @param {URL} source - Source URL of the media file (supported protocols: http, https)
   * @param {URL} destination - Destination URL of the transcoded media files (supported protocols: s3)
   * @param {PoolTranscodeOptions} options - Transcode options
   * @example
   * const source = new URL('https://example.com/video.mp4');
   * const destination = new URL('s3://mybucket/video/');
   *
   * // Transcode the first 10 seconds of the video
   * await pool.transcode(source, destination, { duration: 10 });
   *
   * // Transcode the entire video and create a streaming package
   * await pool.transcode(source, destination, { packageDestination: new URL('s3://mybucket/streaming/') });
   */
  public async transcode(
    source: URL,
    destination: URL,
    { profile, duration, packageDestination }: PoolTranscodeOptions
  ) {
    if (!this.token) {
      throw new Error('Pool not initialized');
    }
    if (this.instances.length == 0) {
      throw new Error('Pool not initialized');
    }
    const name =
      this.instances[Math.floor(Math.random() * this.instances.length)];
    const instance = await getInstance(
      this.context,
      'encore',
      name,
      this.token
    );
    const jobId = Math.random().toString(36).substring(7);
    const encoreJobUrl = new URL('/encoreJobs', instance.url);
    const data = await createFetch<any>(encoreJobUrl, {
      method: 'POST',
      body: JSON.stringify({
        profile: profile || 'program',
        outputFolder: `/usercontent/${jobId}`,
        baseName: jobId,
        duration: duration,
        progressCallbackUri: this.encoreCallbacks[name]?.getCallbackUrl(),
        inputs: [
          {
            type: 'AudioVideo',
            uri: source.toString()
          }
        ]
      }),
      headers: {
        'x-jwt': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    const encoreJob = JSON.parse(data);
    if (!this.encoreCallbacks[name]?.getCallbackUrl()) {
      const job = await waitForEncoreJobToComplete(
        new URL(encoreJobUrl.toString() + '/' + encoreJob.id),
        this.token,
        this.context
      );
      Log().debug(job);
      const outputFiles: FileOutput[] = job.output.filter(
        (file: FileOutput) =>
          file.type === 'VideoFile' || file.type === 'AudioFile'
      );
      const transferPromises = outputFiles.map((file) =>
        transferFile(
          this.context,
          path.basename(file.file),
          new URL(file.file, instance.url),
          destination,
          this.token || ''
        )
      );
      await Promise.all(transferPromises);
      if (packageDestination) {
        Log().debug(`Creating streaming package on ${packageDestination}`);
        const videos = outputFiles
          .filter((file) => file.type === 'VideoFile')
          .map((file) => path.basename(file.file));
        const audio = outputFiles.find(
          (file) => file.type === 'AudioFile'
        )?.file;
        Log().debug(videos, audio);
        if (videos && audio) {
          await createStreamingPackage(
            this.context,
            destination,
            videos,
            path.basename(audio),
            packageDestination
          );
        }
      }
    } else {
      if (this.packageDestination) {
        packageDestination = this.packageDestination;
      }
      if (packageDestination) {
        // Create packaging queue processor
        if (!this.redisPackagingQueue) {
          throw new Error('Packaging queue not initialized');
        }
        const redisUrl = await this.redisPackagingQueue.getRedisUrl();
        if (!redisUrl) {
          throw new Error('Failed to get Redis URL');
        }
        this.encorePackager = new EncorePackager({
          context: this.context,
          name: 'packager',
          redisUrl: redisUrl.toString(),
          outputFolder: packageDestination.toString()
        });
        await this.encorePackager.init();
        Log().info(
          'Streaming packaging delegated to Encore Packager to output to ' +
            packageDestination
        );
      }
    }
  }
}
