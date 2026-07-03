import barrelFiles from 'eslint-plugin-barrel-files';
import i18next from 'eslint-plugin-i18next';
import importX from 'eslint-plugin-import-x';
import jsdoc from 'eslint-plugin-jsdoc';
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
    'eslint.config.js',
    'eslintv10.config.js',
    'package-lock.json',
    'i18n-scripts/**',
    'coverage/**',
    'gui-test-screenshots/**',
    'cypress/gui-test-screenshots/**',
    'cypress/cypress-a11y-report.json',
    'locales/**',
    '.github/**', // will be removed when errors are fixed, in the meantime it is linted by default eslint.config.js
    'webpack.config.ts', // will be removed when errors are fixed, in the meantime it is linted by default eslint.config.js
    'i18next-parser.config.js', // will be removed when errors are fixed, in the meantime it is linted by default eslint.config.js
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
  plugins: {
    'barrel-files': barrelFiles,
    i18next,
    'import-x': importX,
    promise,
    'react-hooks': reactHooks,
    'simple-import-sort': simpleImportSort,
    unicorn,
  },
  rules: {
    'barrel-files/avoid-barrel-files': 'warn',
    'barrel-files/avoid-re-export-all': 'error',
    curly: ['error', 'all'],
    eqeqeq: ['error', 'always'],
    'i18next/no-literal-string': 'error',
    'id-length': [
      'error',
      { exceptions: ['t', 'e', 'i', 'a', 'b', 'vm', 'vmi', 'ns'], min: 3, properties: 'never' },
    ],
    'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
    'no-console': 'error',
    'no-else-return': ['error', { allowElseIf: false }],
    'no-nested-ternary': 'error',
    'no-param-reassign': ['error', { props: false }],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['lodash'],
            message:
              'Import specific lodash modules (e.g., lodash/get) instead of the full bundle.',
          },
        ],
      },
    ],

    'no-var': 'error',
    'no-warning-comments': ['warn', { location: 'start', terms: ['todo', 'fixme', 'hack', 'xxx'] }],
    'prefer-const': 'error',
    'promise/always-return': 'warn',
    'promise/catch-or-return': ['error', { allowFinally: true }],
    'promise/no-nesting': 'warn',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/immutability': 'error',
    'react-hooks/incompatible-library': 'warn',
    'react-hooks/preserve-manual-memoization': 'error',
    'react-hooks/purity': 'error',
    'react-hooks/refs': 'error',

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/set-state-in-render': 'error',
    'react-hooks/unsupported-syntax': 'error',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          [
            '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
          ],
          ['^react', '^\\w'],
          ['^(@|config/)(/*|$)'],
          ['^\\u0000'],
          ['^\\.\\.(?!/?$)', '^\\.\\/?$'],
          ['^\\.\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ['^.+\\.s?css$'],
        ],
      },
    ],
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
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
    ],
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
      { format: ['PascalCase', 'UPPER_CASE'], selector: 'enumMember' },
      { format: null, selector: 'property' },
      { format: ['camelCase'], leadingUnderscore: 'allow', selector: 'parameter' },
      { format: null, selector: 'import' },
    ],
    '@typescript-eslint/no-deprecated': 'error',
    '@typescript-eslint/no-explicit-any': 'error',

    '@typescript-eslint/no-floating-promises': 'error',
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
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowBoolean: true, allowNumber: true },
    ],
  },
}));

const sonarConfig = {
  ...sonarjs.configs.recommended,
  files: ['**/*.{js,jsx,ts,tsx}'],
  rules: {
    ...sonarjs.configs.recommended.rules,
    'sonarjs/deprecation': 'off',
    'sonarjs/fixme-tag': 'off',
    'sonarjs/function-return-type': 'off',
    'sonarjs/no-globals-shadowing': 'off',
    'sonarjs/no-unused-vars': 'off',
    'sonarjs/todo-tag': 'off',
    'sonarjs/unused-import': 'off',
  },
};

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

const perfectionistOverrides = {
  files: ['**/*.{js,jsx,ts,tsx}'],
  rules: {
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-intersection-types': 'off',
    'perfectionist/sort-modules': 'off',
    'perfectionist/sort-named-imports': 'off',
    'perfectionist/sort-sets': 'off',
    'perfectionist/sort-switch-case': 'off',
  },
};

const testingLibraryConfig = {
  ...testingLibrary.configs['flat/react'],
  files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
};

const testFilesOverrides = {
  files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
  rules: {
    'i18next/no-literal-string': 'off',
  },
};

const prettierOverrides = {
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
};

const jsdocConfig = {
  files: ['src/utils/**/*.{js,ts,tsx}'],
  plugins: { jsdoc },
  rules: {
    'jsdoc/require-jsdoc': [
      'warn',
      {
        require: {
          FunctionDeclaration: true,
          FunctionExpression: true,
        },
      },
    ],
    'jsdoc/require-param': 'warn',
    'jsdoc/require-param-name': 'warn',
    'jsdoc/require-param-type': 'off',
    'jsdoc/require-property': 'warn',
    'jsdoc/require-property-description': 'warn',
    'jsdoc/require-property-name': 'warn',
    'jsdoc/require-property-type': 'warn',
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
  reactConfig,
  sonarConfig,
  perfectionist.configs['recommended-alphabetical'],
  perfectionistOverrides,
  testingLibraryConfig,
  testFilesOverrides,
  prettier,
  prettierOverrides,
  jsdocConfig,
  githubScriptsOverrides,
];
