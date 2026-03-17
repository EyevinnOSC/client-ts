import {
  MobileBackendConfig,
  AuthConfig,
  DatabaseConfig,
  StorageConfig,
  ImageTransformConfig
} from './types';

export {
  MobileBackendConfig,
  AuthConfig,
  DatabaseConfig,
  StorageConfig,
  ImageTransformConfig
};

export class MobileBackendClient {
  private config: MobileBackendConfig;

  constructor(config: MobileBackendConfig) {
    this.config = config;
  }
}
