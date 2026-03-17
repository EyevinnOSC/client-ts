import {
  MobileBackendConfig,
  AuthConfig,
  DatabaseConfig,
  StorageConfig,
  ImageTransformConfig
} from './types';
import { ImageModule, ImageTransformOptions } from './image';
import { DatabaseModule, DatabaseError } from './database';

export {
  MobileBackendConfig,
  AuthConfig,
  DatabaseConfig,
  StorageConfig,
  ImageTransformConfig,
  ImageModule,
  ImageTransformOptions,
  DatabaseModule,
  DatabaseError
};

export class MobileBackendClient {
  private config: MobileBackendConfig;
  private _image?: ImageModule;
  private _db?: DatabaseModule;

  constructor(config: MobileBackendConfig) {
    this.config = config;
  }

  get image(): ImageModule {
    if (!this._image) {
      if (!this.config.imageTransform) {
        throw new Error(
          'imageTransform configuration is required to use the image module'
        );
      }
      this._image = new ImageModule(this.config.imageTransform.url);
    }
    return this._image;
  }

  get db(): DatabaseModule {
    if (!this._db) {
      if (!this.config.database) {
        throw new Error(
          'database configuration is required to use the database module'
        );
      }
      this._db = new DatabaseModule(
        this.config.database.url,
        () => this.config.sat
      );
    }
    return this._db;
  }
}
