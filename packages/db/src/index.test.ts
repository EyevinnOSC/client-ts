import { Context, getInternalEndpoint } from '@osaas/client-core';
import { getApacheCouchdbInstance } from '@osaas/client-services';
import { setupDatabase } from '.';

jest.mock('@osaas/client-core', () => {
  return {
    getInternalEndpoint: jest.fn(),
    getPortsForInstance: jest.fn(),
    Context: jest.fn().mockImplementation(() => {
      return {
        getServiceAccessToken: jest.fn().mockResolvedValue('token')
      };
    })
  };
});

jest.mock('@osaas/client-services', () => {
  return {
    getApacheCouchdbInstance: jest.fn(),
    createApacheCouchdbInstance: jest.fn()
  };
});

describe('setupDatabase couchdb', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns an http:// URL for a private (publicAccess: false) instance', async () => {
    (getApacheCouchdbInstance as jest.Mock).mockResolvedValue({
      name: 'myinstance',
      url: 'https://myinstance.apache-couchdb.auto.dev.osaas.io',
      AdminPassword: 'secret'
    });
    (getInternalEndpoint as jest.Mock).mockResolvedValue({
      serviceDns: 'myinstance.apache-couchdb.svc.cluster.local',
      ports: [{ name: 'couchdb', port: 5984, protocol: 'TCP' }],
      publicAccess: false
    });

    const ctx = new Context();
    const url = await setupDatabase(ctx, 'couchdb', 'myinstance', {
      rootPassword: 'secret',
      publicAccess: false
    });

    expect(url).toMatch(/^http:\/\//);
    expect(url).toBe(
      'http://admin:secret@myinstance.apache-couchdb.svc.cluster.local:5984'
    );
  });

  it('returns an https:// URL for a public instance', async () => {
    (getApacheCouchdbInstance as jest.Mock).mockResolvedValue({
      name: 'myinstance',
      url: 'https://myinstance.apache-couchdb.auto.dev.osaas.io',
      AdminPassword: 'secret'
    });

    const ctx = new Context();
    const url = await setupDatabase(ctx, 'couchdb', 'myinstance', {
      rootPassword: 'secret'
    });

    expect(url).toMatch(/^https:\/\//);
    expect(getInternalEndpoint).not.toHaveBeenCalled();
  });
});
