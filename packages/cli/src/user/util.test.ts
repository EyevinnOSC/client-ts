import { instanceOptsToPayload, makeSafeName } from './util';

describe('util functions', () => {
  test('can parse instance options containing =', () => {
    const opts = [`cmdLineArgs=-i "hejhopp=tjohopp"`];
    const payload = instanceOptsToPayload(opts);
    expect(payload).toEqual({ cmdLineArgs: '-i "hejhopp=tjohopp"' });
  });

  test('can parse instance options containing = not in quotes', () => {
    const opts = [`cmdLineArgs=-i hejhopp=tjohopp`];
    const payload = instanceOptsToPayload(opts);
    expect(payload).toEqual({ cmdLineArgs: '-i hejhopp=tjohopp' });
  });

  describe('makeSafeName', () => {
    test('should remove dashes from instance name', () => {
      expect(makeSafeName('my-test-instance')).toBe('mytestinstance');
    });

    test('should preserve alphanumeric characters', () => {
      expect(makeSafeName('test123')).toBe('test123');
    });

    test('should convert to lowercase', () => {
      expect(makeSafeName('MyTestInstance')).toBe('mytestinstance');
    });

    test('should remove all non-alphanumeric characters', () => {
      expect(makeSafeName('My-Test_Instance@123!')).toBe('mytestinstance123');
    });

    test('should handle empty string', () => {
      expect(makeSafeName('')).toBe('');
    });

    test('should handle string with only special characters', () => {
      expect(makeSafeName('!@#$%^&*()')).toBe('');
    });
  });
});
