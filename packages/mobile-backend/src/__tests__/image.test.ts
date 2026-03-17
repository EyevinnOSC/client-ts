import { ImageModule } from '../image';
import { MobileBackendClient } from '../index';

describe('ImageModule', () => {
  const baseUrl = 'https://myflyimg.auto.prod.osaas.io';
  let image: ImageModule;

  beforeEach(() => {
    image = new ImageModule(baseUrl);
  });

  it('should build URL with width and height', () => {
    const url = image.transform('https://example.com/photo.jpg', {
      width: 200,
      height: 200
    });
    expect(url).toBe(
      'https://myflyimg.auto.prod.osaas.io/upload/w_200,h_200/https://example.com/photo.jpg'
    );
  });

  it('should build URL with quality parameter', () => {
    const url = image.transform('https://example.com/photo.jpg', {
      quality: 80
    });
    expect(url).toBe(
      'https://myflyimg.auto.prod.osaas.io/upload/q_80/https://example.com/photo.jpg'
    );
  });

  it('should build URL with all options', () => {
    const url = image.transform('https://example.com/photo.jpg', {
      width: 300,
      height: 200,
      quality: 85,
      crop: true
    });
    expect(url).toBe(
      'https://myflyimg.auto.prod.osaas.io/upload/w_300,h_200,q_85,c_1/https://example.com/photo.jpg'
    );
  });

  it('should build URL with no options', () => {
    const url = image.transform('https://example.com/photo.jpg');
    expect(url).toBe(
      'https://myflyimg.auto.prod.osaas.io/upload/https://example.com/photo.jpg'
    );
  });

  it('should handle trailing slash in baseUrl', () => {
    const img = new ImageModule('https://example.com/');
    const url = img.transform('https://photo.jpg', { width: 100 });
    expect(url).toBe('https://example.com/upload/w_100/https://photo.jpg');
  });
});

describe('MobileBackendClient.image', () => {
  it('should throw if imageTransform not configured', () => {
    const client = new MobileBackendClient({});
    expect(() => client.image).toThrow(
      'imageTransform configuration is required'
    );
  });

  it('should return ImageModule when configured', () => {
    const client = new MobileBackendClient({
      imageTransform: { url: 'https://flyimg.example.com' }
    });
    expect(client.image).toBeInstanceOf(ImageModule);
  });

  it('should return same instance on repeated access', () => {
    const client = new MobileBackendClient({
      imageTransform: { url: 'https://flyimg.example.com' }
    });
    expect(client.image).toBe(client.image);
  });
});
