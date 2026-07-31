/**
 * Build and push the kubevirt-plugin container image using Podman.
 * Podman has no native Node.js SDK for builds (socket required),
 * so this uses execSync for the build/push commands but handles
 * label parsing and step summary in TypeScript.
 *
 * Env: KUBEVIRT_PLUGIN_IMAGE, LABELS
 */

import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const image = requireEnv('KUBEVIRT_PLUGIN_IMAGE');
  const labelsRaw = process.env.LABELS ?? '';

  // Write step summary
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    appendFileSync(summaryFile, `## Labels\n\`\`\`\n${labelsRaw}\n\`\`\`\n`);
  }
  console.log(`## Labels\n\`\`\`\n${labelsRaw}\n\`\`\``);

  // Build label args (quay.expires-after triggers automatic tag expiration on Quay.io)
  const labelArgs = [
    ...labelsRaw
      .split('\n')
      .filter((line) => line.trim() !== '')
      .flatMap((line) => ['--label', line.trim()]),
    '--label',
    'quay.expires-after=2h',
  ];

  // Build
  const repoRoot =
    process.env.GITHUB_WORKSPACE ??
    execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const buildArgs = ['build', ...labelArgs, '-t', image, '-f', `${repoRoot}/Dockerfile`, repoRoot];
  console.log(`Building: ${image}`);
  execFileSync('podman', buildArgs, { stdio: 'inherit' });

  // Push
  console.log(`Pushing: ${image}`);
  execFileSync('podman', ['push', image], { stdio: 'inherit' });
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
