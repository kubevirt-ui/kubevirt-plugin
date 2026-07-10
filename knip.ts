import fs from 'node:fs';
import path from 'node:path';

import pluginMetadata from './plugin-metadata';

const existsAsFile = (candidate: string): boolean => {
  const fullPath = path.join(process.cwd(), candidate);

  try {
    return fs.statSync(fullPath).isFile();
  } catch {
    return false;
  }
};

const resolveExposedModulePath = (modulePath: string): string => {
  let resolved = modulePath;

  if (modulePath.startsWith('src/')) {
    resolved = modulePath;
  } else if (modulePath.startsWith('./')) {
    resolved = `src/${modulePath.slice(2)}`;
  }

  const candidates = [
    resolved,
    `${resolved}.ts`,
    `${resolved}.tsx`,
    `${resolved}/index.ts`,
    `${resolved}/index.tsx`,
  ];

  for (const candidate of candidates) {
    if (existsAsFile(candidate)) {
      return candidate;
    }
  }

  return resolved;
};

const exposedModuleEntries = [
  ...new Set(
    Object.values(pluginMetadata.exposedModules ?? {}).map((modulePath) =>
      resolveExposedModulePath(modulePath),
    ),
  ),
];

export default {
  entry: [
    'plugin-extensions.ts',
    'plugin-metadata.ts',
    'webpack.config.ts',
    'src/utils/extension.ts',
    'src/**/extensions.ts',
    'src/extensions/**/*.ts',
    'src/views/navigation/virtualizationSection.ts',
    ...exposedModuleEntries,
  ],
  project: ['src/**/*.{ts,tsx}', 'plugin-extensions.ts', 'plugin-metadata.ts', 'webpack.config.ts'],
  ignore: ['i18n-scripts/**'],
  ignoreDependencies: ['husky', 'process', 'prettier', 'lint-staged', 'buffer', 'global'],
  ignoreExportsUsedInFile: {
    interface: true,
    type: true,
  },
  ignoreUnresolved: ['./react', './i18next', String.raw`^<rootDir>/`],
  jest: true,
  treatConfigHintsAsErrors: false,
};
