import { Context } from '@osaas/client-core';
import { validateCommonAccessToken } from '../src/cat';

async function main() {
  const ctx = new Context();
  const result = await validateCommonAccessToken(
    ctx,
    '2D3RhEOhAQWhBFBha2FtYWlfa2V5X2hzMjU2WB2kAWdleWV2aW5uAmVqb25hcwYaZ9TH9QUaZ9TH9Vgg40JB9G77k5RWOlayUSLDl7oFVnnyb4aHYc1qls148WY',
    {
      signingKey:
        '403697de87af64611c1d32a05dab0fe1fcb715a86ab435f1ec99192d79569388'
    }
  );
  console.log(result.status);
  console.log(result.payload);
}

main();
