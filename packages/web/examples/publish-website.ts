import { Context, Log } from '@osaas/client-core';
import { publishToMyPages } from '../src/index';

async function main() {
  const ctx = new Context();

  try {
    const page = await publishToMyPages(
      'www',
      '/Users/birme/Code/eyevinn/www/dist',
      ctx
    );
    console.log(page.url);
  } catch (err) {
    Log().error(err);
  }
}

main();
