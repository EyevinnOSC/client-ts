export const createClient = jest.fn(() => ({
  authorize: jest.fn(),
  exchange: jest.fn(),
  verify: jest.fn(),
  refresh: jest.fn()
}));
