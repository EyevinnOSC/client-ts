import {
  CloudFrontClient,
  CreateDistributionCommand,
  CreateDistributionRequest
} from '@aws-sdk/client-cloudfront';
import { Context, getInstance } from '@osaas/client-core';

export interface CdnOpts {
  originPath: string;
  rootObject?: string;
}

export async function createCloudfrontDistribution(
  serviceId: string,
  instanceName: string,
  ctx: Context,
  opts?: CdnOpts
) {
  const sat = await ctx.getServiceAccessToken(serviceId);
  const instance = await getInstance(ctx, serviceId, instanceName, sat);
  if (!instance) {
    throw new Error(`Instance ${instanceName} not found`);
  }
  const originHostname = new URL(instance.url).hostname;

  const client = new CloudFrontClient();
  const input: CreateDistributionRequest = {
    DistributionConfig: {
      CallerReference: Date.now().toString(),
      Comment: `CDN for ${serviceId}-${instanceName}`,
      DefaultRootObject: opts?.rootObject,
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: originHostname,
            DomainName: originHostname,
            OriginPath: opts?.originPath,
            CustomOriginConfig: {
              HTTPPort: 80,
              HTTPSPort: 443,
              OriginProtocolPolicy: 'https-only',
              OriginSslProtocols: {
                Quantity: 1,
                Items: ['TLSv1.2']
              }
            }
          }
        ]
      },
      DefaultCacheBehavior: {
        TargetOriginId: originHostname,
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 7,
          Items: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE']
        },
        Compress: true,
        CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6',
        OriginRequestPolicyId: '59781a5b-3903-41f3-afcb-af62929ccde1'
      },
      Enabled: true
    }
  };
  const command = new CreateDistributionCommand(input);
  const response = await client.send(command);
  return response.Distribution;
}
