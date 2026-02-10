import { Context } from './context';
import { createFetch } from './fetch';

export type MyApp = {
  id: string;
  name: string;
  type: string;
  gitHubUrl: string;
  url: string;
  appDns: string;
  tenantId: string;
};

export type CreateMyAppBody = {
  name: string;
  type: string;
  gitHubUrl: string;
  gitHubToken?: string;
  configService?: string;
};

export async function listMyApps(ctx: Context): Promise<MyApp[]> {
  const url = new URL(
    '/myapps',
    `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`
  );
  return await createFetch<MyApp[]>(url, {
    method: 'GET',
    headers: {
      'x-pat-jwt': `Bearer ${ctx.getPersonalAccessToken()}`
    }
  });
}

export async function createMyApp(
  ctx: Context,
  body: CreateMyAppBody
): Promise<MyApp> {
  const url = new URL(
    '/myapps',
    `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`
  );
  return await createFetch<MyApp>(url, {
    method: 'POST',
    headers: {
      'x-pat-jwt': `Bearer ${ctx.getPersonalAccessToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

export async function getMyApp(ctx: Context, appId: string): Promise<MyApp> {
  const url = new URL(
    `/myapps/${appId}`,
    `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`
  );
  return await createFetch<MyApp>(url, {
    method: 'GET',
    headers: {
      'x-pat-jwt': `Bearer ${ctx.getPersonalAccessToken()}`
    }
  });
}

export async function removeMyApp(ctx: Context, appId: string): Promise<void> {
  const url = new URL(
    `/myapps/${appId}`,
    `https://deploy.svc.${ctx.getEnvironment()}.osaas.io`
  );
  await createFetch<void>(url, {
    method: 'DELETE',
    headers: {
      'x-pat-jwt': `Bearer ${ctx.getPersonalAccessToken()}`
    }
  });
}
