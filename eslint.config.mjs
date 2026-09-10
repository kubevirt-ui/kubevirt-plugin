import i18next from 'eslint-plugin-i18next';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import testingLibrary from 'eslint-plugin-testing-library';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

import eslintReact from '@eslint-react/eslint-plugin';

const ignoresConfig = {
  ignores: [
    'dist/**',
    'node_modules/**',
    'eslintv10.config.mjs',
    'package-lock.json',
    'i18n-scripts/**',
    'coverage/**',
    'gui-test-screenshots/**',
    'cypress/gui-test-screenshots/**',
    'cypress/cypress-a11y-report.json',
    'locales/**',
    'playwright/**',
    'jest-setup.ts',
    'jest.config.ts',
    'playwright.config.ts',
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
    unicorn,
  },
  rules: {
    curly: ['error', 'all'],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'i18next/no-literal-string': 'error',
    'id-length': [
      'error',
      {
        exceptions: ['t', 'e', 'i', 'a', 'b', 'id', 'ID', 'vm', 'VM', 'vmi', 'VMI', 'ns', 'NS'],
        min: 3,
        properties: 'never',
      },
    ],
    'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
    'no-console': 'error',
    'no-else-return': ['error', { allowElseIf: false }],
    'no-nested-ternary': 'error',
    'no-param-reassign': ['error', { props: false }],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            message:
              'Import specific lodash modules (e.g., lodash/get) instead of the full bundle.',
            name: 'lodash',
          },
        ],
      },
    ],
    'no-var': 'error',
    'no-warning-comments': ['warn', { location: 'start', terms: ['todo', 'fixme', 'hack', 'xxx'] }],
    'prefer-const': 'error',
    'promise/always-return': ['warn', { ignoreLastCallback: true }],
    'promise/no-nesting': 'warn',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
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
    'unicorn/no-for-each': 'error',
    'unicorn/no-lonely-if': 'error',
    'unicorn/no-useless-spread': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/throw-new-error': 'error',
  },
  settings: {
    'import-x/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      typescript: {},
    },
  },
};

const tsConfigs = tseslint.configs.recommended.map((config) => ({
  ...config,
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      project: './tsconfig.eslint.json',
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    ...config.rules,
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      { format: ['camelCase'], leadingUnderscore: 'allow', selector: 'default' },
      {
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        selector: 'variable',
      },
      { format: ['camelCase', 'PascalCase'], selector: 'function' },
      { format: ['PascalCase'], selector: 'typeLike' },
      { format: ['PascalCase', 'UPPER_CASE'], selector: 'enum' },
      { format: ['PascalCase', 'UPPER_CASE'], selector: 'enumMember' },
      { format: null, selector: 'property' },
      { format: ['camelCase'], leadingUnderscore: 'allow', selector: 'parameter' },
      { format: null, selector: 'import' },
    ],
    '@typescript-eslint/no-deprecated': 'error',
    '@typescript-eslint/no-explicit-any': 'error',

    '@typescript-eslint/no-floating-promises': [
      'error',
      {
        allowForKnownSafeCalls: [
          {
            from: 'package',
            name: 'NavigateFunction',
            package: 'react-router',
          },
        ],
        ignoreVoid: true,
      },
    ],
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTaggedTemplates: true,
        allowTernary: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/prefer-nullish-coalescing': [
      'error',
      {
        ignorePrimitives: {
          boolean: true,
        },
      },
    ],
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowBoolean: true, allowNumber: true },
    ],
  },
}));

const reactConfig = {
  ...eslintReact.configs['recommended-typescript'],
  files: ['**/*.{ts,tsx}'],
  rules: {
    ...eslintReact.configs['recommended-typescript'].rules,
    '@eslint-react/exhaustive-deps': 'off',
    '@eslint-react/purity': 'off',
    '@eslint-react/rules-of-hooks': 'off',
    // TODO: tackle set-state-in-effect in a later version — 82 files affected
    '@eslint-react/set-state-in-effect': 'off',
    '@eslint-react/set-state-in-render': 'off',
    '@eslint-react/unsupported-syntax': 'off',
  },
};

const sonarConfig = {
  ...sonarjs.configs.recommended,
  files: ['**/*.{js,jsx,ts,tsx}'],
  rules: {
    ...sonarjs.configs.recommended.rules,
    'sonarjs/deprecation': 'off',
    'sonarjs/fixme-tag': 'off',
    'sonarjs/function-return-type': 'off',
    'sonarjs/no-globals-shadowing': 'off',
    'sonarjs/no-redundant-jump': 'off',
    'sonarjs/no-unused-vars': 'off',
    'sonarjs/super-linear-regex': 'off',
    'sonarjs/todo-tag': 'off',
    'sonarjs/unused-import': 'off',
  },
};

const allSonarjsRulesOff = Object.fromEntries(
  Object.keys(sonarjs.configs.recommended.rules).map((rule) => [rule, 'off']),
);

const prettierOverrides = {
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
};

const githubScriptsOverrides = {
  files: ['.github/**/*.{ts,tsx,js,jsx}', 'ci-scripts/**/*.{ts,tsx,js,jsx}'],
  rules: {
    ...allSonarjsRulesOff,
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
    ...allSonarjsRulesOff,
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    'i18next/no-literal-string': 'off',
    'id-length': 'off',
    'max-lines': 'off',
  },
};
//part 2 will add the rules for the playwright tests.
export default [
  ignoresConfig,
  baseConfig,
  ...tsConfigs,
  reactConfig,
  sonarConfig,
  prettier,
  prettierOverrides,
  githubScriptsOverrides,
  testingLibraryConfig,
  testFilesOverrides,
];
