/**
 * Delete a ROKS cluster on job failure.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');

  console.log(`Job failed — deleting ROKS cluster '${clusterName}'...`);
  try {
    execSync(`ibmcloud oc cluster rm --cluster "${clusterName}" -f --force-delete-storage`, {
      stdio: 'inherit',
    });
  } catch {
    console.log('WARNING: cluster deletion failed or cluster not found');
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
