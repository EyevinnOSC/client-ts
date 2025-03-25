import { Context } from '@osaas/client-core';
import { listTranscodeJobs } from '../src/index';

async function main() {
  const ctx = new Context();
  try {
    const jobs = await listTranscodeJobs(ctx, 'demo', {
      endpointUrl: new URL('https://eyevinnlab-demo.encore.prod.osaas.io/'),
      bearerToken: await ctx.getServiceAccessToken('encore')
    });
    console.log(jobs.map((job) => job.id));
  } catch (err) {
    console.log((err as Error).message);
  }
}

main();
