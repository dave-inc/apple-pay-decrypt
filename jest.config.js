module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'tsx', 'json', 'node'],
  verbose: true,
  preset: 'ts-jest',
  restoreMocks: true,
  resetMocks: true,
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  testPathIgnorePatterns: ['<rootDir>/dist'],
};
