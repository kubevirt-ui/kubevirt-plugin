/**
 * Create a multi-arch Docker manifest list from per-platform digest files
 * in the current working directory and push it to the registry.
 *
 * Required env: REGISTRY_IMAGE, VERSION_TAG
 */

import { readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const registryImage = requireEnv('REGISTRY_IMAGE');
  const versionTag = requireEnv('VERSION_TAG');
  const digestDir = requireEnv('DIGEST_DIR');

  const digests = readdirSync(digestDir);
  if (digests.length === 0) {
    throw new Error(`No digest files found in ${digestDir}`);
  }

  const sources = digests.map((d) => `${registryImage}@sha256:${d}`).join(' ');
  const cmd = `docker buildx imagetools create -t ${registryImage}:${versionTag} ${sources}`;

  console.log(`Creating manifest: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
