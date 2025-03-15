import { Context } from '@osaas/client-core';
import { generateCommonAccessToken } from '../src/cat';

async function main() {
  const ctx = new Context();
  const token = await generateCommonAccessToken(
    ctx,
    {
      iss: 'eyevinn',
      sub: 'jonas'
    },
    {
      signingKey:
        '403697de87af64611c1d32a05dab0fe1fcb715a86ab435f1ec99192d79569388'
    }
  );
  console.log(token);
}

main();
