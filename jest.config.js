/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testRegex: 'src/.*\\.test\\.ts$',
  modulePathIgnorePatterns: ['<rootDir>/lib'],
}
