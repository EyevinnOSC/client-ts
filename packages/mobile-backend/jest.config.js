module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node-single-context',
  modulePathIgnorePatterns: ['lib/'],
  moduleNameMapper: {
    '^@openauthjs/openauth/client$':
      '<rootDir>/src/__mocks__/@openauthjs/openauth/client.ts'
  }
};
