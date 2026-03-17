import { StorageModule } from '../storage';
import { MobileBackendClient } from '../index';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn((input) => ({ _type: 'PutObject', input })),
  GetObjectCommand: jest.fn((input) => ({ _type: 'GetObject', input })),
  ListObjectsV2Command: jest.fn((input) => ({ _type: 'ListObjects', input })),
  DeleteObjectCommand: jest.fn((input) => ({ _type: 'DeleteObject', input }))
}));

const mockGetSignedUrl = jest
  .fn()
  .mockResolvedValue('https://presigned-url.example.com/file');

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args)
}));

const storageConfig = {
  endpoint: 'https://s3.example.com',
  accessKey: 'access-key',
  secretKey: 'secret-key',
  bucket: 'my-bucket'
};

describe('StorageModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSignedUrl.mockResolvedValue(
      'https://presigned-url.example.com/file'
    );
  });

  describe('upload()', () => {
    it('sends PutObjectCommand and returns key and presigned URL', async () => {
      mockSend.mockResolvedValueOnce({});

      const mod = new StorageModule(storageConfig);
      const result = await mod.upload(
        'images/photo.jpg',
        new Uint8Array([1, 2, 3])
      );

      expect(mockSend).toHaveBeenCalledTimes(1);
      const sentCmd = mockSend.mock.calls[0][0];
      expect(sentCmd._type).toBe('PutObject');
      expect(sentCmd.input.Bucket).toBe('my-bucket');
      expect(sentCmd.input.Key).toBe('images/photo.jpg');

      expect(result).toEqual({
        key: 'images/photo.jpg',
        url: 'https://presigned-url.example.com/file'
      });
    });

    it('passes contentType when provided', async () => {
      mockSend.mockResolvedValueOnce({});

      const mod = new StorageModule(storageConfig);
      await mod.upload('images/photo.jpg', new Uint8Array([1, 2, 3]), {
        contentType: 'image/jpeg'
      });

      const sentCmd = mockSend.mock.calls[0][0];
      expect(sentCmd.input.ContentType).toBe('image/jpeg');
    });
  });

  describe('getSignedUrl()', () => {
    it('returns presigned URL with default expiry of 3600', async () => {
      const mod = new StorageModule(storageConfig);
      const url = await mod.getSignedUrl('images/photo.jpg');

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          _type: 'GetObject',
          input: { Bucket: 'my-bucket', Key: 'images/photo.jpg' }
        }),
        { expiresIn: 3600 }
      );
      expect(url).toBe('https://presigned-url.example.com/file');
    });

    it('passes custom expiresIn when provided', async () => {
      const mod = new StorageModule(storageConfig);
      await mod.getSignedUrl('images/photo.jpg', { expiresIn: 7200 });

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 7200 }
      );
    });
  });

  describe('list()', () => {
    it('returns parsed StorageObjects from response', async () => {
      const lastModified = new Date('2024-01-15T10:00:00Z');
      mockSend.mockResolvedValueOnce({
        Contents: [
          { Key: 'images/photo.jpg', Size: 1024, LastModified: lastModified },
          { Key: 'images/photo2.jpg', Size: 2048, LastModified: lastModified }
        ]
      });

      const mod = new StorageModule(storageConfig);
      const result = await mod.list();

      expect(result).toEqual([
        { key: 'images/photo.jpg', size: 1024, lastModified },
        { key: 'images/photo2.jpg', size: 2048, lastModified }
      ]);
    });

    it('returns empty array when Contents is undefined', async () => {
      mockSend.mockResolvedValueOnce({});

      const mod = new StorageModule(storageConfig);
      const result = await mod.list();

      expect(result).toEqual([]);
    });

    it('passes prefix to ListObjectsV2Command', async () => {
      mockSend.mockResolvedValueOnce({ Contents: [] });

      const mod = new StorageModule(storageConfig);
      await mod.list('images/');

      const sentCmd = mockSend.mock.calls[0][0];
      expect(sentCmd._type).toBe('ListObjects');
      expect(sentCmd.input.Prefix).toBe('images/');
      expect(sentCmd.input.Bucket).toBe('my-bucket');
    });
  });

  describe('remove()', () => {
    it('sends DeleteObjectCommand for the given key', async () => {
      mockSend.mockResolvedValueOnce({});

      const mod = new StorageModule(storageConfig);
      await mod.remove('images/photo.jpg');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const sentCmd = mockSend.mock.calls[0][0];
      expect(sentCmd._type).toBe('DeleteObject');
      expect(sentCmd.input.Bucket).toBe('my-bucket');
      expect(sentCmd.input.Key).toBe('images/photo.jpg');
    });
  });
});

describe('MobileBackendClient.storage', () => {
  it('throws when storage config is not provided', () => {
    const client = new MobileBackendClient({ sat: 'test-sat' });
    expect(() => client.storage).toThrow(
      'storage configuration is required to use the storage module'
    );
  });

  it('returns a StorageModule instance when storage config is provided', () => {
    const client = new MobileBackendClient({ storage: storageConfig });
    expect(client.storage).toBeInstanceOf(StorageModule);
  });

  it('returns the same StorageModule instance on repeated access', () => {
    const client = new MobileBackendClient({ storage: storageConfig });
    const first = client.storage;
    const second = client.storage;
    expect(first).toBe(second);
  });
});
