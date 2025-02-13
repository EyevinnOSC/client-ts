import { setupDatabase } from '../src';
import Redis from 'ioredis';

async function main() {
  const dbUrl = await setupDatabase('valkey', 'myvalkey', {
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
