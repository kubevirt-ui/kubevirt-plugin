'use strict';

// Ensure that all PatternFly modules have a single version resolution.

// Use `npm query` CLI to cover all resolutions, including ones that got pulled
// into the node_modules tree indirectly via dependencies and devDependencies.

import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

type NpmQueryResult = { name: string; version: string }[];
type ModuleNameToVersionSet = Record<string, Set<string>>;

const modulesPath = resolve(import.meta.dirname, '../node_modules');

if (!existsSync(modulesPath) || !statSync(modulesPath).isDirectory()) {
  console.error(`${modulesPath} directory not found`);
  process.exit(1);
}

const patternFlyModuleResolutions: NpmQueryResult = JSON.parse(
  execFileSync('npm', ['query', '[name^="@patternfly/"]', '--json'], { encoding: 'utf8' }),
);

const moduleNameToVersions = patternFlyModuleResolutions.reduce<ModuleNameToVersionSet>(
  (acc, { name, version }) => {
    acc[name] = acc[name] ?? new Set();
    acc[name].add(version);
    return acc;
  },
  {},
);

const modulesWithMultipleResolutions = Object.entries(moduleNameToVersions)
  .filter(([, versionSet]) => versionSet.size > 1)
  .map(([name]) => name);

if (modulesWithMultipleResolutions.length > 0) {
  console.error('Following modules have multiple version resolutions:\n');
  console.error(
    modulesWithMultipleResolutions
      .map((name) => `${name}: ${[...moduleNameToVersions[name]].join(', ')}`)
      .join('\n'),
  );
  console.error('\nUse "npm why <module>" to inspect module resolution details.');
  process.exit(1);
}
