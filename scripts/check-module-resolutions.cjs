'use strict';

// Ensure that all PatternFly modules have a single version resolution.

// Use `npm query` CLI to cover all resolutions, including ones that got pulled
// into the node_modules tree indirectly via dependencies and devDependencies.

const { execFileSync } = require('node:child_process');

const patternFlyModuleResolutions = JSON.parse(
  execFileSync('npm', ['query', '[name^="@patternfly/"]', '--json'], { encoding: 'utf8' }),
);

const resolutionCounts = patternFlyModuleResolutions.reduce((counts, { name }) => {
  counts[name] = (counts[name] ?? 0) + 1;
  return counts;
}, {});

const modulesWithMultipleResolutions = Object.entries(resolutionCounts)
  .filter(([, count]) => count > 1)
  .map(([name]) => name);

if (modulesWithMultipleResolutions.length > 0) {
  console.error('Following PatternFly modules have more than one version resolution:\n');
  console.error(modulesWithMultipleResolutions.join('\n'), '\n');
  console.error('Use `npm why <module>` to inspect module resolution details.');

  process.exit(1);
}
