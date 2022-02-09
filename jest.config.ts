/* eslint-disable @typescript-eslint/no-var-requires */
import { pathsToModuleNameMapper } from 'ts-jest';

import type { Config } from '@jest/types';
const { compilerOptions } = require('./tsconfig');

// Sync object
const config: Config.InitialOptions = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {
    '^.+\\.[t|j]sx?$': 'ts-jest',
  },
  testURL: 'http://localhost/',
  testRegex: '.*\\.test\\.(ts|tsx|js|jsx)$',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@patternfly|@openshift-console\\S*?)/.*)'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|svg)$': '<rootDir>/__mocks__/dummy.ts',
    '@console/*': '<rootDir>/__mocks__/dummy.ts',
    'react-i18next': '<rootDir>/__mocks__/react-i18next.ts',
    'react-router-dom': '<rootDir>/__mocks__/react-router-dom.ts',
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: {
        ignoreCodes: ['TS151001'],
      },
    },
  },
};
export default config;
