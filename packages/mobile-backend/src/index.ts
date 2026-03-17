import {
  MobileBackendConfig,
  AuthConfig,
  DatabaseConfig,
  StorageConfig,
  ImageTransformConfig
} from './types';
import { ImageModule, ImageTransformOptions } from './image';

export {
  MobileBackendConfig,
  AuthConfig,
  DatabaseConfig,
  StorageConfig,
  ImageTransformConfig,
  ImageModule,
  ImageTransformOptions
};

export class MobileBackendClient {
  private config: MobileBackendConfig;
  private _image?: ImageModule;

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
}
