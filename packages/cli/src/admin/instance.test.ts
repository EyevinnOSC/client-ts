import { createFetch } from '@osaas/client-core';
import { getInstancesToRemove } from './instance';

jest.mock('@osaas/client-core', () => ({
  ...jest.requireActual('@osaas/client-core'),
  createFetch: jest.fn()
}));
jest.mock('./token', () => ({ generatePat: jest.fn(), apiKey: () => 'k' }));

describe('getInstancesToRemove', () => {
  it('dedupes pods of the same instance', async () => {
    (createFetch as jest.Mock).mockResolvedValue([
      { tenantId: 't', serviceId: 's', instanceName: 'a', created: '' },
      { tenantId: 't', serviceId: 's', instanceName: 'a', created: '' },
      { tenantId: 't', serviceId: 's', instanceName: 'b', created: '' },
      { tenantId: 't', serviceId: 'x', instanceName: 'a', created: '' }
    ]);
    const res = await getInstancesToRemove('t', 'prod');
    expect(res).toEqual([
      { serviceId: 's', instance: 'a' },
      { serviceId: 's', instance: 'b' },
      { serviceId: 'x', instance: 'a' }
    ]);
  });
});
