# @osaas/client-db

SDK for Open Source Cloud DB services

## Usage

Prerequisites

- An account on [Open Source Cloud](www.osaas.io)

```
npm install --save @osaas/client-db
```

Example code creating a Valkey database and use a Redis client to connect with it

```javascript
import { setupDatabase } from '@osaas/client-db';
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
```
