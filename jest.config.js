const {pathsToModuleNameMapper} = require('ts-jest/utils');
const {compilerOptions} = require('./tsconfig');

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
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>'}),
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '<rootDir>/packages/.*(node_modules)(?!.*css-modules-theme.*).*$',
  ],
  verbose: true,
};
