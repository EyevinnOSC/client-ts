## Open Source Cloud Client Libraries for Javascript

---
<div align="center">

## Quick Demo: Open Source Cloud

Run this service in the cloud with a single click.

[![Badge OSC](https://img.shields.io/badge/Try%20it%20out!-1E3A8A?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8yODIxXzMxNjcyKSIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI3IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8yODIxXzMxNjcyIiB4MT0iMTIiIHkxPSIwIiB4Mj0iMTIiIHkyPSIyNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjQzE4M0ZGIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzREQzlGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=)](https://app.osaas.io/browse/eyevinn-osaas-client-ts)

</div>

---

Javascript client libraries for [Open Source Cloud](https://www.osaas.io). The Javascript client libraries for [Open Source Cloud API](https://api.osaas.io) are implemented in Typescript, for server-side use with Node and is [open source](https://github.com/Eyevinn/osaas-client-ts).

- [Signup for Open Source Cloud](https://app.osaas.io)
- [Open Source Cloud Documentation](https://docs.osaas.io)
- [Source code](https://github.com/Eyevinn/osaas-client-ts)

The Javascript client libraries for Open Source Cloud are implemented in Typescript and for server-side use with Node.

The core library includes general functionality to create, list and delete service instances or jobs. They are generic and can be used with any type of service in Open Source Cloud.

### Installation

```
npm install @osaas/client-core
```

### Getting Started

Assuming that you already have an account at Open Source Cloud you need your Personal Access Token t
hat you find under `Settings` in the web user interface. This is your secret and should never be add
ed in plain text in code.

Required for all functions is to setup a `Context`. A context contains configuration on which environment to access and the Personal Access Token. In normal cases you don't need to change this and you would use the defaults.

To create a context:

```javascript
const ctx = new Context();
```

It will read the Personal Access Token from the environment variable `OSC_ACCESS_TOKEN`. To override the default configuration and read the token from another environment variable, here called `MY_TOKEN`, and connect to the development environment you setup a context as below.

```javascript
const ctx = new Context({ personalAccessToken: process.env.MY_TOKEN })
```

To create, list or remove a service instance you then need to obtain a temporary Service Access Token (SAT) first. This is achieved with the `getServiceAccessToken()`. For example to get an SAT for the service `eyevinn-chaos-stream-proxy` you write.

```javascript
const serviceAccessToken = await ctx.getServiceAccessToken(
  'eyevinn-chaos-stream-proxy'
);
```

With the Service Access Token you can now create a Chaos Stream Proxy instance.

```javascript
const instance = await createInstance(
  ctx,
  'eyevinn-chaos-stream-proxy',
  serviceAccessToken,
  { name: 'example' }
);
console.log(instance.url);
```

### What is Open Source Cloud?

A software as a service based on open source with a unique transparent model where revenue is shared with the open source authors. Open Source Cloud offers media industry companies a quick way to incorporate open source in their solutions and the option to run the same software in-house as the source code is publicly available.

### Development

Prerequisites:

- Lerna (install with `npm install -g lerna`)

Install dependencies

```
npm install
```

Build libraries

```
npm run build
```

Release

```
npm run lerna:version
```

Publish to NPM is then executed with GitHub actions.

We use conventional commits to enforce semantic versioning.
