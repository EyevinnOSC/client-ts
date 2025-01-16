# @osaas/client-web

SDK for static website publishing in Open Source Cloud

## Usage

Prerequisites

- An account on [Eyevinn Open Source Cloud](www.osaas.io)

```
npm install --save @osaas/client-web
```

Example code

```javascript
import { Context, Log } from '@osaas/client-core';
import { publish } from '@osaas/client-web';

async function main() {
  const ctx = new Context();

  try {
    const ctx = new Context({ environment });
    await publish('www', '/Users/birme/Code/eyevinn/www/dist', ctx, { sync: true });
  } catch (err) {
    Log().error(err);
  }
}

main();
```

## About Open Source Cloud

Open Source Cloud reduces the barrier to get started with open source without having to host it on your own infrastructure.

Start building software solutions based on open and detachable ready-to-run cloud components with Open Source Cloud. Full code transparency, never locked in and a business model that contributes back to the open source community. Offering a wide range of components from media and more to help you build the best solution for you and your users.

www.osaas.io
