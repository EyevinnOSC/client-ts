import { Context } from '@osaas/client-core';
import { IntercomSystem } from '../src';

async function main() {
  const ctx = new Context();

  const intercom = new IntercomSystem({ context: ctx, name: 'mcptest' });
  await intercom.init();

  const productions = await intercom.listProductions();
  productions.forEach((prod) => {
    console.log(`Production: ${prod.name} (${prod.productionId})`);
    prod.lines.forEach((line) => {
      console.log(`  Line: ${line.name}`);
      line.participants.forEach((participant) => {
        console.log(`    Participant: ${participant.name}`);
      });
    });
  });

  if (!productions.map((prod) => prod.name).includes('my-production')) {
    console.log('Creating production...');
    await intercom.createProduction('my-production', [
      { name: 'Line 1', programOutputLine: true },
      { name: 'Line 2', programOutputLine: false }
    ]);
  }

  (await intercom.listProductions()).forEach(async (prod) => {
    console.log(`Deleting production: ${prod.name} (${prod.productionId})`);
    await intercom.deleteProduction(prod.productionId);
  });
}

main();
