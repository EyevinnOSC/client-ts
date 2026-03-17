export interface AuthConfig {
  issuer: string;
  clientID: string;
}

export interface DatabaseConfig {
  url: string;
}

export interface StorageConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export interface ImageTransformConfig {
  url: string;
}

export interface MobileBackendConfig {
  sat?: string;
  auth?: AuthConfig;
  database?: DatabaseConfig;
  storage?: StorageConfig;
  imageTransform?: ImageTransformConfig;
}
