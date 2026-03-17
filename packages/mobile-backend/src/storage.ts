import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadResult {
  key: string;
  url: string;
}

export interface StorageObject {
  key: string;
  size: number;
  lastModified: Date;
}

export class StorageModule {
  private client: S3Client;
  private bucket: string;

  constructor(config: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
  }) {
    this.bucket = config.bucket;
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey
      },
      forcePathStyle: true
    });
  }

  async upload(
    key: string,
    body: Blob | Uint8Array | ReadableStream,
    opts?: { contentType?: string }
  ): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Body: body as any,
        ContentType: opts?.contentType
      })
    );

    const url = await this.getSignedUrl(key);
    return { key, url };
  }

  async getSignedUrl(
    key: string,
    opts?: { expiresIn?: number }
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      }),
      { expiresIn: opts?.expiresIn ?? 3600 }
    );
  }

  async list(prefix?: string): Promise<StorageObject[]> {
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix
      })
    );

    return (response.Contents ?? [])
      .filter(
        (obj): obj is typeof obj & { Key: string } => obj.Key !== undefined
      )
      .map((obj) => ({
        key: obj.Key,
        size: obj.Size ?? 0,
        lastModified: obj.LastModified ?? new Date(0)
      }));
  }

  async remove(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })
    );
  }
}
