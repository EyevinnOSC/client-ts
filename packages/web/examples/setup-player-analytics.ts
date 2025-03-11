import { Context } from '@osaas/client-core';
import { setupPlayerAnalyticsPipeline } from '../src';

async function main() {
  const ctx = new Context();
  try {
    const pipeline = await setupPlayerAnalyticsPipeline(ctx, 'demo', {
      sinks: 2,
      workers: 1
    });
    console.log(pipeline);
  } catch (err) {
    console.log(err);
  }
}

main();
