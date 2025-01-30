# @osaas/client-services

Automatically generated typed service resources.

- [SDK Reference Documentation](https://js.docs.osaas.io)

## Usage

```javascript
import { Context, Log } from '@osaas/client-core';
import {
  EyevinnTestAdserver,
  EyevinnTestAdserverConfig,
  createEyevinnTestAdserverInstance
} from '@osaas/client-services';

const ctx = new Context();

try {
  const config: EyevinnTestAdserverConfig = {
    name: 'sdk'
  };
  const instance: EyevinnTestAdserver = await createEyevinnTestAdserverInstance(
    ctx,
    config
  );
  console.log(instance.url);
} catch (err) {
  Log().error(err);
}
```

## Development

Generate types and functions

```
% CATALOG_SVC_URL=https://catalog.svc.prod.osaas.io \
  CATALOG_SVC_API_KEY=<key> \
  npm run generate
```

Build

```
% npm run build
```
