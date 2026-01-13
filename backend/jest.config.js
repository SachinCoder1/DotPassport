module.exports = {
  // Use ts-jest as the preset, which configures Jest for TypeScript
  preset: 'ts-jest',

  // The environment in which the tests should be run (Node.js)
  testEnvironment: 'node',

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Ignore compiled JS files in dist folder
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Load environment variables from .env.test file
  setupFiles: ['./src/test/loadEnv.ts'],

  // A map from regular expressions to module names that allow to stub out resources
  // This is CRITICAL for handling your custom path aliases like "~/*"
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
  },

  // A list of paths to modules that run some code to configure or set up the testing framework before each test file
  // We will create this file in the next step.
  setupFilesAfterEnv: ['./src/test/setup.ts'],
};
