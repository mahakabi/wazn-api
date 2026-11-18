import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }] },
  collectCoverageFrom: [
    '**/*.ts',
    '!generated/**',
    '!**/testing/**',
    '!main.ts',
    '!**/*.module.ts',
  ],
  coverageDirectory: '../coverage',
  // The generated Prisma client imports './x.js' (needed by Node at runtime); Jest resolves the .ts source.
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  testEnvironment: 'node',
};

export default config;
