module.exports = {
  automock: false,
  bail: false,
  browser: false,
  projects: ['<rootDir>/packages'],
  testRunner: 'jest-circus/runner',
  transform: {'^.+\\.jsx?$': '<rootDir>/jest.transform.js'},
  transformIgnorePatterns: [
    "<rootDir>/packages/.*(node_modules)(?!.*css-modules-theme.*).*$",
  ],
  verbose: true,
};