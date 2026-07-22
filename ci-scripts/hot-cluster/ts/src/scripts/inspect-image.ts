/**
 * Inspect a multi-arch Docker image manifest.
 *
 * Required env: REGISTRY_IMAGE, VERSION_TAG
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const registryImage = requireEnv('REGISTRY_IMAGE');
  const versionTag = requireEnv('VERSION_TAG');

  execSync(`docker buildx imagetools inspect ${registryImage}:${versionTag}`, {
    stdio: 'inherit',
  });
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
