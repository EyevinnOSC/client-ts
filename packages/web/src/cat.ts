import { Context, waitForInstanceReady } from '@osaas/client-core';
import {
  AndersnasNodecatConfig,
  createAndersnasNodecatInstance,
  getAndersnasNodecatInstance
} from '@osaas/client-services';

type Claims = { [key: string]: string | number };

interface CatOptions {
  signingKey: string;
  instanceName?: string;
}

/**
 * Generate a Common Access Token (CTA-5007) using Andersnas Nodecat open webservice
 *
 * @memberof module:@osaas/client-web
 * @async
 * @param {Context} ctx - Eyevinn OSC context
 * @param {Claims} claims - Claims to be included in the token
 * @param {CatOptions} opts - Service options
 * @returns {Promise<string>} - The generated token
 *
 * @example
 * import { Context } from '@osaas/client-core';
 * import { generateCommonAccessToken } from '@osaas/client-web';
 *
 * const ctx = new Context();
 * const token = await generateCommonAccessToken(
 *   ctx,
 *   {
 *     iss: 'eyevinn',
 *     sub: 'jonas'
 *   },
 *   {
 *     signingKey:
 *       '403697de87af64611c1d32a05dab0fe1fcb715a86ab435f1ec99192d79569388'
 *   }
 * );
 * console.log(token);
 * // 2D3RhEOhAQWhBFBha2FtYWlfa2V5X2hzMjU2WB2kAWdleWV2aW5uAmVqb25hcwYaZ9TH9QUaZ9TH9Vgg40JB9G77k5RWOlayUSLDl7oFVnnyb4aHYc1qls148WY
 */
export async function generateCommonAccessToken(
  ctx: Context,
  claims: Claims,
  opts: CatOptions
) {
  const instanceName = opts.instanceName || 'default';
  let instance = await getAndersnasNodecatInstance(ctx, instanceName);
  if (!instance) {
    const config: AndersnasNodecatConfig = {
      name: instanceName,
      SigningKey: opts.signingKey
    };
    instance = await createAndersnasNodecatInstance(ctx, config);
    await waitForInstanceReady('andersnas-nodecat', instanceName, ctx);
  }

  const sat = await ctx.getServiceAccessToken('andersnas-nodecat');
  const apiUrl = new URL('/generateToken', instance.url);
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sat}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(claims)
  });
  if (!response.ok) {
    throw new Error(`Failed to generate token: ${response.statusText}`);
  }
  const token = await response.text();
  return token;
}
