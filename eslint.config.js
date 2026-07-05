import i18next from 'eslint-plugin-i18next';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import promise from 'eslint-plugin-promise';
import testingLibrary from 'eslint-plugin-testing-library';
import tseslint from 'typescript-eslint';

const ignoresConfig = {
  ignores: [
    'dist/**',
    'node_modules/**',
    'eslintv10.config.js',
    'package-lock.json',
    'i18n-scripts/**',
    'coverage/**',
    'gui-test-screenshots/**',
    'cypress/gui-test-screenshots/**',
    'cypress/cypress-a11y-report.json',
    'locales/**',
  ],
};

const baseConfig = {
  files: ['**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    ecmaVersion: 2021,
    globals: {
      document: 'readonly',
      navigator: 'readonly',
      window: 'readonly',
    },
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
    sourceType: 'module',
  },
  linterOptions: {
    reportUnusedDisableDirectives: 'off',
  },
  plugins: {
    i18next,
    perfectionist,
    promise,
    'react-hooks': reactHooks,
    'simple-import-sort': simpleImportSort,
  },
  rules: {
    'i18next/no-literal-string': 'error',
    'no-console': 'error',
    'no-nested-ternary': 'error',
    'perfectionist/sort-classes': [
      'error',
      {
        groups: [
          'static-property',
          'private-property',
          'property',
          'constructor',
          'static-method',
          'private-method',
          'method',
        ],
        order: 'asc',
        type: 'natural',
      },
    ],
    'promise/always-return': ['warn', { ignoreLastCallback: true }],
    'promise/catch-or-return': ['error', { allowFinally: true }],
    'promise/no-nesting': 'warn',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'simple-import-sort/exports': 'off',
    'simple-import-sort/imports': 'off',
  },
  settings: {
    'import-x/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      typescript: {},
    },
  },
};

const tsConfigs = [{ ...tseslint.configs.base, files: ['**/*.{ts,tsx}'] }];

const prettierOverrides = {
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
};

const githubScriptsOverrides = {
  files: ['.github/**/*.{ts,tsx,js,jsx}'],
  rules: {
    'no-console': 'off',
  },
};

const testingLibraryConfig = {
  ...testingLibrary.configs['flat/react'],
  files: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
};

const testFilesOverrides = {
  files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
  rules: {
    'i18next/no-literal-string': 'off',
  },
};

export default [
  ignoresConfig,
  baseConfig,
  ...tsConfigs,
  prettier,
  prettierOverrides,
  githubScriptsOverrides,
  testingLibraryConfig,
  testFilesOverrides,
];
