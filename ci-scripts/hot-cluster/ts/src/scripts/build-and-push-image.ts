/**
 * Build and push the kubevirt-plugin container image using Podman.
 * Podman has no native Node.js SDK for builds (socket required),
 * so this uses execSync for the build/push commands but handles
 * label parsing and step summary in TypeScript.
 *
 * Env: KUBEVIRT_PLUGIN_IMAGE, LABELS
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = (): void => {
  const image = requireEnv('KUBEVIRT_PLUGIN_IMAGE');
  const labelsRaw = process.env.LABELS ?? '';

  // Write step summary
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    appendFileSync(summaryFile, `## Labels\n\`\`\`\n${labelsRaw}\n\`\`\`\n`);
  }
  console.log(`## Labels\n\`\`\`\n${labelsRaw}\n\`\`\``);

  // Build label args
  const labelArgs = labelsRaw
    .split('\n')
    .filter((line) => line.trim() !== '')
    .flatMap((line) => ['--label', line.trim()]);

  // Build
  const buildCmd = ['podman', 'build', ...labelArgs, '-t', image, '-f', 'Dockerfile', '.'].join(' ');
  console.log(`Building: ${image}`);
  execSync(buildCmd, { stdio: 'inherit' });

  // Push
  console.log(`Pushing: ${image}`);
  execSync(`podman push ${image}`, { stdio: 'inherit' });
};

main();
