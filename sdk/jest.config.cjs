/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest for TypeScript transformation
  preset: 'ts-jest',

  // Use jsdom for DOM testing (widgets render HTML)
  testEnvironment: 'jsdom',

  // Automatically clear mock calls between tests
  clearMocks: true,

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Collect coverage from source files only
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts', // Index files are just re-exports
  ],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/demo-app/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/demo-app/'],

  // Test file patterns
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],

  // Module resolution for ES modules
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Transform settings for ts-jest
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'node',
        },
      },
    ],
  },

  // Setup files
  setupFilesAfterEnv: ['./src/__tests__/setup.ts'],

  // Verbose output for better debugging
  verbose: true,

  // Test timeout (widgets may have async operations)
  testTimeout: 10000,
};
