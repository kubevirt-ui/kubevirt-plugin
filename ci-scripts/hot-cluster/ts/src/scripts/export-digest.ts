/**
 * Export a Docker build digest to a temp directory as an empty file named
 * after the digest (without the sha256: prefix).
 *
 * Required env: DIGEST, DIGEST_DIR
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const digest = requireEnv('DIGEST');
  const digestDir = requireEnv('DIGEST_DIR');

  mkdirSync(digestDir, { recursive: true });

  const stripped = digest.replace(/^sha256:/, '');
  const filePath = join(digestDir, stripped);
  writeFileSync(filePath, '');

  console.log(`Exported digest: ${filePath}`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
