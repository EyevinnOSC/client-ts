# @osaas/client-core

- [SDK Reference Documentation](https://js.docs.osaas.io)

## Usage

### Launch a Chaos Stream Proxy

```javascript
import { Context, Log, createInstance } from '@osaas/client-core';

const ctx = new Context();

try {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-chaos-stream-proxy'
  );
  Log().info(serviceAccessToken);

  const instance = await createInstance(
    ctx,
    'eyevinn-chaos-stream-proxy',
    serviceAccessToken,
    { name: 'sdk' }
  );
  console.log(instance.url);
} catch (err) {
  Log().error(err);
}
```

### Remove a Chaos Stream Proxy

```javascript
import { Context, Log, removeInstance } from '@osaas/client-core';

const ctx = new Context();

try {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-chaos-stream-proxy'
  );
  Log().info(serviceAccessToken);

  await removeInstance(
    ctx,
    'eyevinn-chaos-stream-proxy',
    'sdk',
    serviceAccessToken
  );
} catch (err) {
  Log().error(err);
}
```
