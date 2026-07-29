/**
 * Destroy an IPI cluster on job failure using openshift-install.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: IC_API_KEY, INSTALL_DIR
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  requireEnv('IC_API_KEY');
  const installDir = requireEnv('INSTALL_DIR');

  const metadataPath = `${installDir}/metadata.json`;
  if (!existsSync(metadataPath)) {
    console.log('No metadata.json found — no IPI resources to clean up via openshift-install.');
    return;
  }

  const infraId = ((): string => {
    try {
      return execSync(`jq -r '.infraID' "${metadataPath}"`, { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  })();

  console.log(`Job failed — destroying IPI cluster '${infraId}'...`);
  try {
    execSync(`openshift-install destroy cluster --dir="${installDir}" --log-level=info`, {
      stdio: 'inherit',
    });
  } catch {
    /* best effort */
  }

  console.log('IPI cluster destroyed.');
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
