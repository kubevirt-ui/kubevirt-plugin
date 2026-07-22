/**
 * Check whether a ROKS cluster exists and configure kubeconfig if it does.
 * Outputs `exists=true|false` to GITHUB_OUTPUT.
 *
 * Required env: CLUSTER_NAME
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');

  let exists = false;
  try {
    execSync(`ibmcloud oc cluster get --cluster "${clusterName}"`, { stdio: 'pipe' });
    exists = true;
  } catch {
    exists = false;
  }

  if (exists) {
    console.log(`Cluster '${clusterName}' found`);
    appendFileSync(process.env.GITHUB_OUTPUT!, 'exists=true\n');
    try {
      execSync(`ibmcloud oc cluster config --cluster "${clusterName}" --admin`, { stdio: 'inherit' });
    } catch {
      console.warn('Failed to configure cluster admin kubeconfig, continuing anyway');
    }
  } else {
    console.log(`Cluster '${clusterName}' not found, nothing to tear down`);
    appendFileSync(process.env.GITHUB_OUTPUT!, 'exists=false\n');
  }
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
