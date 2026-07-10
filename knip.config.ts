export default {
  entry: ['plugin-extensions.ts', 'plugin-metadata.ts', 'webpack.config.ts'],
  ignore: ['i18n-scripts/**'],
  ignoreDependencies: ['husky', 'process', 'prettier', 'lint-staged', 'buffer', 'global'],
  ignoreExportsUsedInFile: {
    interface: true,
    type: true,
  },
  ignoreUnresolved: ['./react', './i18next', String.raw`^<rootDir>/`],
  jest: true,
  project: ['src/**/*.{ts,tsx}', 'webpack.config.ts'],
  treatConfigHintsAsErrors: false,
};
