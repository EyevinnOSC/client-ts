import { Context, listReservedNodes, Log } from '../src/index';

async function main() {
  const ctx = new Context();

  try {
    const myNodes = await listReservedNodes(ctx);
    console.log(myNodes);
  } catch (err) {
    Log().error(err);
  }
}

main();
