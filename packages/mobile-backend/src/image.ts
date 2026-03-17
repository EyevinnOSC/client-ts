export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  crop?: boolean;
}

export class ImageModule {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  transform(sourceUrl: string, options: ImageTransformOptions = {}): string {
    const params: string[] = [];
    if (options.width !== undefined) params.push(`w_${options.width}`);
    if (options.height !== undefined) params.push(`h_${options.height}`);
    if (options.quality !== undefined) params.push(`q_${options.quality}`);
    if (options.crop !== undefined) params.push(`c_${options.crop ? 1 : 0}`);

    const paramString = params.length > 0 ? params.join(',') : '';
    return paramString
      ? `${this.baseUrl}/upload/${paramString}/${sourceUrl}`
      : `${this.baseUrl}/upload/${sourceUrl}`;
  }
}
