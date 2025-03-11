import { Context, isValidInstanceName, Log } from '@osaas/client-core';
import {
  createEyevinnPlayerAnalyticsEventsinkInstance,
  createPoundifdefSmoothmqInstance,
  EyevinnPlayerAnalyticsEventsink,
  EyevinnPlayerAnalyticsEventsinkConfig,
  getEyevinnPlayerAnalyticsEventsinkInstance,
  getPoundifdefSmoothmqInstance,
  PoundifdefSmoothmq,
  PoundifdefSmoothmqConfig,
  removeEyevinnPlayerAnalyticsEventsinkInstance,
  removePoundifdefSmoothmqInstance
} from '@osaas/client-services';
import { randomBytes } from 'crypto';

export interface PlayerAnalyticsPipeline {
  name: string;
  eventSinks: Omit<EyevinnPlayerAnalyticsEventsink, 'resources'>[];
}

export interface PlayerAnalyticsPipelineOptions {
  sinks?: number;
  workers?: number;
}

async function createMessageQueue(ctx: Context, name: string) {
  let instance = await getPoundifdefSmoothmqInstance(ctx, name);
  if (!instance) {
    const config: PoundifdefSmoothmqConfig = {
      name,
      AccessKey: 'eventuser',
      SecretKey: randomBytes(16).toString('hex')
    };
    instance = await createPoundifdefSmoothmqInstance(ctx, config);
    if (!instance) {
      throw new Error(`Failed to create message queue: ${name}`);
    }
  }
  return instance;
}

async function createEventSink(
  ctx: Context,
  name: string,
  messageQueueInstance: PoundifdefSmoothmq
) {
  let instance = await getEyevinnPlayerAnalyticsEventsinkInstance(ctx, name);
  if (!instance) {
    const config: EyevinnPlayerAnalyticsEventsinkConfig = {
      name,
      SqsQueueUrl: 'https://sqs.us-east-1.amazonaws.com/1/events',
      SqsEndpoint: messageQueueInstance.url,
      AwsAccessKeyId: messageQueueInstance.AccessKey!,
      AwsSecretAccessKey: messageQueueInstance.SecretKey!
    };
    instance = await createEyevinnPlayerAnalyticsEventsinkInstance(ctx, config);
    if (!instance) {
      throw new Error(`Failed to create event sink: ${name}`);
    }
  }
  return instance;
}

export async function setupPlayerAnalyticsPipeline(
  ctx: Context,
  name: string,
  opts?: PlayerAnalyticsPipelineOptions
): Promise<PlayerAnalyticsPipeline> {
  if (!isValidInstanceName(name)) {
    throw new Error(
      `Invalid website identifier (lowercase letters and numbers allowed): ${name}`
    );
  }
  const sinks = opts?.sinks || 1;
  const workers = opts?.workers || 1;
  const messageQueue = await createMessageQueue(ctx, name);
  const sinkNames = Array.from({ length: sinks }, (_, i) => `${name}${i + 1}`);
  const eventSinks = [];
  for (const sinkName of sinkNames) {
    const eventSink = await createEventSink(ctx, sinkName, messageQueue);
    eventSinks.push(eventSink);
  }

  return {
    name,
    eventSinks
  };
}

export async function teardownPlayerAnalyticsPipeline(
  ctx: Context,
  pipeline: PlayerAnalyticsPipeline
) {
  for (const eventSink of pipeline.eventSinks) {
    if (await getEyevinnPlayerAnalyticsEventsinkInstance(ctx, eventSink.name)) {
      await removeEyevinnPlayerAnalyticsEventsinkInstance(ctx, eventSink.name);
    }
  }
  if (await getPoundifdefSmoothmqInstance(ctx, pipeline.name)) {
    await removePoundifdefSmoothmqInstance(ctx, pipeline.name);
  }
}
