# @osaas/client-mobile-backend

Client SDK for [Eyevinn Open Source Cloud](https://www.osaas.io) Mobile Backend solution. Provides unified access to auth, database, storage, and image transform services.

## Install

```
npm install @osaas/client-mobile-backend
```

## Quick Start

```typescript
import { MobileBackendClient } from '@osaas/client-mobile-backend';

const client = new MobileBackendClient({
  sat: 'your-service-access-token',
  auth: {
    issuer: 'https://myauth.auto.prod.osaas.io',
    clientID: 'my-app'
  },
  database: {
    url: 'https://myrest.auto.prod.osaas.io'
  },
  storage: {
    endpoint: 'https://myminio.auto.prod.osaas.io',
    accessKey: 'minioadmin',
    secretKey: 'your-secret',
    bucket: 'app-assets'
  },
  imageTransform: {
    url: 'https://myflyimg.auto.prod.osaas.io'
  }
});
```

All config fields are optional — only configure the modules you use.

## Modules

### Auth

Wraps [@openauthjs/openauth](https://openauth.js.org/) for email + verification code authentication.

```typescript
// Start auth flow (redirects user to OpenAuth UI)
const { url, challenge } = await client.auth.authorize(
  'https://myapp.com/callback',
  { pkce: true }
);
// Redirect user to `url`, store `challenge`

// After callback, exchange code for tokens
const result = await client.auth.exchange(
  code,
  redirectUri,
  challenge?.verifier
);
if (!result.err) {
  client.auth.setTokens(result.tokens);
}

// Get current user ID (decoded from access token JWT)
const userId = client.auth.getUserId();

// Get Authorization header value
const authHeader = client.auth.getAuthHeader(); // "Bearer <token>"

// Refresh tokens
const refreshed = await client.auth.refresh(refreshToken);

// Verify a token against your subject schemas
const verified = await client.auth.verify(subjects, accessToken, {
  refresh: refreshToken
});
```

### Database

Thin fetch wrapper for [PostgREST](https://postgrest.org/). Auto-attaches the SAT as an `Authorization: Bearer` header on every request.

```typescript
// CRUD operations
const todos = await client.db.get<Todo[]>('/todos?user_id=eq.123');
const newTodo = await client.db.post<Todo>('/todos', {
  title: 'Buy milk',
  user_id: '123'
});
await client.db.patch('/todos?id=eq.5', { completed: true });
await client.db.delete('/todos?id=eq.5');

// Use with @supabase/postgrest-js for a query builder
import { PostgrestClient } from '@supabase/postgrest-js';
const postgrest = new PostgrestClient(client.db.baseUrl, {
  fetch: client.db.fetch
});
const { data } = await postgrest.from('todos').select('*').eq('user_id', '123');
```

Throws `DatabaseError` (with `.status`, `.statusText`, `.body`) on non-2xx responses.

### Storage

S3-compatible object storage via [MinIO](https://min.io/). Uses `@aws-sdk/client-s3` with `forcePathStyle: true`.

```typescript
// Upload a file
const { key, url } = await client.storage.upload('avatars/photo.jpg', file, {
  contentType: 'image/jpeg'
});

// Get a pre-signed download URL (default: 1 hour)
const downloadUrl = await client.storage.getSignedUrl('avatars/photo.jpg', {
  expiresIn: 3600
});

// List objects under a prefix
const objects = await client.storage.list('avatars/');
// objects: Array<{ key: string; size: number; lastModified: Date }>

// Delete an object
await client.storage.remove('avatars/photo.jpg');
```

### Image Transform

URL builder for [Flyimg](https://flyimg.io/) image transforms. Returns a URL string — no HTTP request is made.

```typescript
const thumbUrl = client.image.transform('https://example.com/photo.jpg', {
  width: 200,
  height: 200,
  quality: 80,
  crop: true
});
// => "https://myflyimg.auto.prod.osaas.io/upload/w_200,h_200,q_80,c_1/https://example.com/photo.jpg"
```

## Service Access Token (SAT)

The `sat` field is passed as `Authorization: Bearer <SAT>` on database requests and can be used to gate access to SAT-protected services. The SAT controls service-level access; OpenAuth handles user identity separately.

## Zero Lock-In

This SDK wraps standard protocols:

- **Auth**: OpenID Connect via [OpenAuth](https://openauth.js.org/)
- **Database**: REST via [PostgREST](https://postgrest.org/)
- **Storage**: S3 API via [MinIO](https://min.io/)
- **Image**: HTTP URL construction via [Flyimg](https://flyimg.io/)

You can always use the underlying services directly without this SDK.

## License

MIT
