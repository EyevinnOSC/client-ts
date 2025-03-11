import { Context } from '@osaas/client-core';
import { getTranscodeJob } from '../src/index';

async function main() {
  const ctx = new Context();
  try {
    const job = await getTranscodeJob(
      ctx,
      'demo',
      'fb2baa17-8972-451b-bb1e-1bc773283476'
    );
    console.log(job);
  } catch (err) {
    console.log((err as Error).message);
  }
}

main();
