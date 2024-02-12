/* eslint-disable @typescript-eslint/no-var-requires */
import { pathsToModuleNameMapper } from 'ts-jest';

import type { Config } from '@jest/types';
const { compilerOptions } = require('./tsconfig');

// Sync object
const config: Config.InitialOptions = {
  globals: {
    SERVER_FLAGS: {
      basePath: 'http://localhost:9000/',
    },
    'ts-jest': {
      diagnostics: {
        ignoreCodes: ['TS151001'],
      },
      isolatedModules: true,
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  moduleNameMapper: {
    '@console/*': '<rootDir>/__mocks__/dummy.ts',
    '\\.(css|less|scss|svg)$': '<rootDir>/__mocks__/dummy.ts',
    'react-i18next': '<rootDir>/__mocks__/react-i18next.ts',
    'react-router-dom-v5-compat': '<rootDir>/__mocks__/react-router-dom-v5-compat.ts',
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  },
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  testRegex: '.*\\.test\\.(ts|tsx|js|jsx)$',
  testURL: 'http://localhost/',
  transform: {
    '^.+\\.[t|j]sx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(@kubevirt-ui/kubevirt-api|byte-size|@patternfly|@openshift-console\\S*?)/.*)',
  ],
};
export default config;
