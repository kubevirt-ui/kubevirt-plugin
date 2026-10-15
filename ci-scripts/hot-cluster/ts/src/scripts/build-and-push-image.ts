/**
 * Build and push the kubevirt-plugin container image using Podman.
 * Podman has no native Node.js SDK for builds (socket required),
 * so this uses execSync for the build/push commands but handles
 * label parsing and step summary in TypeScript.
 *
 * Env: KUBEVIRT_PLUGIN_IMAGE, LABELS
 */

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
  // Exclude the infra overlay (and any nested node_modules) from the build
  // context without discarding the branch's own .dockerignore rules. The
  // overlay (.hc-infra) sits under repoRoot, so it would otherwise be copied
  // into the builder stage. Merge the branch's existing ignore file (if any)
  // with our extra patterns into a temp ignorefile and point podman at it --
  // branch-independent, since release branches may have no .dockerignore.
  const branchIgnore = existsSync(`${repoRoot}/.dockerignore`)
    ? readFileSync(`${repoRoot}/.dockerignore`, 'utf8')
    : '';
  const ignoreFile = join(tmpdir(), 'hc-build.dockerignore');
  writeFileSync(ignoreFile, `${branchIgnore}\n.hc-infra\n**/node_modules\n`);

  const buildArgs = [
    'build',
    '--ignorefile',
    ignoreFile,
    ...labelArgs,
    '-t',
    image,
    '-f',
    `${repoRoot}/Dockerfile`,
    repoRoot,
  ];
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
