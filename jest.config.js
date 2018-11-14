module.exports = {
  automock: false,
  bail: false,
  browser: false,
  projects: ['<rootDir>/packages'],
  testRunner: 'jest-circus/runner',
  testMatch: [
    '<rootDir>/packages/**/?(*.)(spec|test).ts?(x)',
  ],
  collectCoverageFrom: [
    '<rootDir>/packages/*/src/**/*.{ts,tsx}',
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
  ],
  transform: {
    '^.+\\.[tj]sx?$': '<rootDir>/jest.transform.js',
  },
  transformIgnorePatterns: [
    "<rootDir>/packages/.*(node_modules)(?!.*css-modules-theme.*).*$",
  ],
  verbose: true,
};