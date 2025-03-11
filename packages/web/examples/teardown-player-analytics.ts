import { Context } from '@osaas/client-core';
import { teardownPlayerAnalyticsPipeline } from '../src/index';

const pipeline = {
  name: 'demo',
  eventSinks: [
    {
      name: 'demo1',
      url: 'https://eyevinnlab-demo1.eyevinn-player-analytics-eventsink.auto.prod.osaas.io',
      SqsQueueUrl: 'https://sqs.us-east-1.amazonaws.com/1/events',
      AwsAccessKeyId: 'eventuser',
      AwsSecretAccessKey: 'db73aa20f4f5a999291e4d3370aacf05',
      SqsEndpoint:
        'https://eyevinnlab-demo.poundifdef-smoothmq.auto.prod.osaas.io'
    },
    {
      name: 'demo2',
      url: 'https://eyevinnlab-demo2.eyevinn-player-analytics-eventsink.auto.prod.osaas.io',
      SqsQueueUrl: 'https://sqs.us-east-1.amazonaws.com/1/events',
      AwsAccessKeyId: 'eventuser',
      AwsSecretAccessKey: 'db73aa20f4f5a999291e4d3370aacf05',
      SqsEndpoint:
        'https://eyevinnlab-demo.poundifdef-smoothmq.auto.prod.osaas.io'
    }
  ]
};

async function main() {
  const ctx = new Context();
  await teardownPlayerAnalyticsPipeline(ctx, pipeline);
}

main();
