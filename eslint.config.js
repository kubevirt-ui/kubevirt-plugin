import jsdoc from 'eslint-plugin-jsdoc';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
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
    jsdoc,
    perfectionist,
    'react-hooks': reactHooks,
    'simple-import-sort': simpleImportSort,
  },
  rules: {
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

export default [
  ignoresConfig,
  baseConfig,
  ...tsConfigs,
  prettier,
  prettierOverrides,
  githubScriptsOverrides,
];
