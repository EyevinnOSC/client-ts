import { Context, Log } from '@osaas/client-core';
import { publish } from '../src/index';

async function main() {
  const ctx = new Context();

  try {
    publish('www', '/Users/birme/Code/eyevinn/www/dist', ctx, { sync: true });
  } catch (err) {
    Log().error(err);
  }
}

main();
