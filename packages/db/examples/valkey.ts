import { Context } from '@osaas/client-core';
import { setupDatabase } from '../src';
import Redis from 'ioredis';

async function main() {
  const ctx = new Context();
  const dbUrl = await setupDatabase(ctx, 'valkey', 'myvalkey', {
    password: 'secret'
  });
  const client = new Redis(dbUrl);
  try {
    await client.subscribe('messages');
    console.log('Waiting for messages...');
    client.on('message', (channel, message) => {
      console.log(`Received message: ${message} from ${channel}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
