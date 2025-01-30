import { spawnSync } from 'child_process';
import { appendFileSync, writeFileSync } from 'node:fs';

const CATALOG_SVC_URL =
  process.env.CATALOG_SVC_URL || 'https://catalog.svc.prod.osaas.io';
const CATALOG_SVC_API_KEY = process.env.CATALOG_SVC_API_KEY;

function toPascalCase(input: string): string {
  return input
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

interface Service {
  serviceId: string;
  apiUrl: string;
  serviceType: string;
  serviceMetadata: {
    title: string;
    description: string;
    documentationUrl?: string;
    instanceNoun: string;
  };
  serviceInstanceOptions: {
    name: string;
    label: string;
    description: string;
    type: string;
    enums: string[];
    mandatory: boolean;
    regexValidator: string;
  }[];
}

async function generate(service: Service) {
  if (service.serviceType === 'instance') {
    const serviceId = service.serviceId;
    const openapiUrl = new URL('/docs/json', service.apiUrl);
    spawnSync('npx', [
      'openapi-typescript',
      openapiUrl.toString(),
      '-o',
      `src/generated/${serviceId}.ts`
    ]);
    const resource = `
export type ${toPascalCase(serviceId)} =
  paths['${
    new URL(service.apiUrl).pathname
  }/{id}']['get']['responses']['200']['schema'];
`;
    appendFileSync(`./src/generated/${serviceId}.ts`, resource);

    const config = `
export type ${toPascalCase(serviceId)}Config =
  paths['${
    new URL(service.apiUrl).pathname
  }']['post']['parameters']['body']['body'];
`;
    appendFileSync(`./src/generated/${serviceId}.ts`, config);

    let typeProps = '';
    service.serviceInstanceOptions.forEach((option) => {
      typeProps += ` * @property {${option.type}} ${
        !option.mandatory ? `[${option.name}]` : option.name
      } - ${option.description || option.label}\n`;
    });
    const create = `import { Context, createInstance, waitForInstanceReady, removeInstance, getInstance } from "@osaas/client-core";
/**
 * @namespace ${serviceId}
 * @description ${service.serviceMetadata.description}
 * @author Eyevinn Technology AB <osc@eyevinn.se>
 * @copyright ${new Date().getFullYear()} Eyevinn Technology AB
 * ${
   service.serviceMetadata.documentationUrl
     ? `@see {@link ${service.serviceMetadata.documentationUrl.replace(
         /%3A/g,
         ':'
       )}|Online docs} for further information`
     : ''
 }
 */

/**
 * @typedef {Object} ${toPascalCase(serviceId)}Config
${typeProps}
 * 
 */

/**
 * @typedef {Object} ${toPascalCase(serviceId)}
 * @property {string} name - Name of the ${
   service.serviceMetadata.title
 } instance
 * @property {string} url - URL of the ${service.serviceMetadata.title} instance
 * 
 */

/**
 * Create a new ${service.serviceMetadata.title} instance
 * 
 * @memberOf ${serviceId}
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {${toPascalCase(
   serviceId
 )}Config} body - Service instance configuration
 * @returns {${toPascalCase(serviceId)}} - Service instance
 * @example
 * import { Context, create${toPascalCase(
   serviceId
 )}Instance } from '@osaas/client-services';
 *
 * const ctx = new Context();
 * const instance = await create${toPascalCase(
   serviceId
 )}Instance(ctx, { name: 'myinstance' });
 * console.log(instance.url);
 */
export async function create${toPascalCase(
      serviceId
    )}Instance(ctx: Context, body: ${toPascalCase(
      serviceId
    )}Config): Promise<${toPascalCase(serviceId)}> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    '${serviceId}'
  );      
  const instance = await createInstance(
    ctx,
    '${serviceId}',
    serviceAccessToken,
    body
  );
  await waitForInstanceReady('${serviceId}', instance.name, ctx);
  return instance;
}

/**
 * Remove a ${service.serviceMetadata.title} instance
 * 
 * @memberOf ${serviceId}
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the ${
   service.serviceMetadata.instanceNoun
 } to be removed
 */
export async function remove${toPascalCase(
      serviceId
    )}Instance(ctx: Context, name: string): Promise<void> {
  const serviceAccessToken = await ctx.getServiceAccessToken(
    '${serviceId}'
  );
  await removeInstance(ctx, '${serviceId}', name, serviceAccessToken);
}

/**
 * Get a ${service.serviceMetadata.title} instance
 * 
 * @memberOf ${serviceId}
 * @async
 * @param {Context} context - Open Source Cloud configuration context
 * @param {string} name - Name of the ${
   service.serviceMetadata.instanceNoun
 } to be retrieved
 * @returns {${toPascalCase(serviceId)}} - Service instance
 */
export async function get${toPascalCase(
      serviceId
    )}Instance(ctx: Context, name: string): Promise<${toPascalCase(
      serviceId
    )}> {
  const serviceAccessToken = await ctx.getServiceAccessToken('${serviceId}');
  return await getInstance(ctx, '${serviceId}', name, serviceAccessToken);
}
`;
    appendFileSync(`./src/generated/${serviceId}.ts`, create);

    const indexTs = `export { ${toPascalCase(serviceId)},\n ${toPascalCase(
      serviceId
    )}Config,\n create${toPascalCase(
      serviceId
    )}Instance,\n remove${toPascalCase(serviceId)}Instance,\n get${toPascalCase(
      serviceId
    )}Instance } from './generated/${serviceId}';\n`;
    appendFileSync('./src/index.ts', indexTs);

    const tests = `
  describe('create${toPascalCase(serviceId)}Instance', () => {
    it('should call createInstance', async () => {
      const ctx = new Context();
      const body = { name: 'sdk' };
      await sdk.create${toPascalCase(serviceId)}Instance(ctx, body as any);
      expect(ctx.getServiceAccessToken).toHaveBeenCalledWith(
        '${serviceId}'
      );
      expect(createInstance).toHaveBeenCalledWith(
        ctx,
        '${serviceId}',
        'token',
        body
      );
      expect(waitForInstanceReady).toHaveBeenCalledWith(
      '${serviceId}',
      'sdk',
      ctx
    );
    });
  });

  describe('remove${toPascalCase(serviceId)}Instance', () => {
    it('should call removeInstance', async () => {
      const ctx = new Context();
      await sdk.remove${toPascalCase(serviceId)}Instance(ctx, 'sdk');
      expect(removeInstance).toHaveBeenCalledWith(
        ctx,
        '${serviceId}',
        'sdk',
        'token'
      );
    });
  });
`;
    appendFileSync('./src/index.test.ts', tests);
  }
}

async function main() {
  if (!CATALOG_SVC_API_KEY) {
    console.error('Missing CATALOG_SVC_API_KEY');
    process.exit(1);
  }

  const indexTs = `/**
  * This file was auto-generated by openapi-typescript.
  * Do not make direct changes to the file.
  */
  `;
  writeFileSync('./src/index.ts', indexTs);
  const tests = `/**
  * This file was auto-generated by openapi-typescript.
  * Do not make direct changes to the file.
  */
import { Context, createInstance, waitForInstanceReady, removeInstance, getInstance } from '@osaas/client-core';
import * as sdk from '.';

jest.mock('@osaas/client-core', () => {
  return {
    createInstance: jest.fn().mockResolvedValue({ name: 'sdk' }),
    removeInstance: jest.fn(),
    getInstance: jest.fn().mockResolvedValue({ name: 'sdk' }),
    waitForInstanceReady: jest.fn(),
    Context: jest.fn().mockImplementation(() => {
      return {
        getServiceAccessToken: jest.fn().mockResolvedValue('token')
      };
    })
  };
});
  `;
  writeFileSync('./src/index.test.ts', tests);

  const res = await fetch(
    new URL('/service?filter=status%3DPUBLISHED', CATALOG_SVC_URL),
    {
      headers: {
        Authorization: `Bearer ${CATALOG_SVC_API_KEY}`,
        'Content-Type': 'application/json'
      },
      method: 'GET'
    }
  );
  if (res.ok) {
    const services: Service[] = (await res.json()) as Service[];
    for (const service of services) {
      await generate(service);
    }
  }
}

main();
