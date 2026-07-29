/**
 * Check whether a ROKS cluster exists and configure kubeconfig if it does.
 * Outputs `exists=true|false` to GITHUB_OUTPUT.
 *
 * Required env: CLUSTER_NAME
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';
import { setOutput } from '../utils';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');

  const exists = ((): boolean => {
    try {
      execSync(`ibmcloud oc cluster get --cluster "${clusterName}"`, { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  })();

  if (exists) {
    console.log(`Cluster '${clusterName}' found`);
    setOutput('exists', 'true');
    try {
      execSync(`ibmcloud oc cluster config --cluster "${clusterName}" --admin`, {
        stdio: 'inherit',
      });
    } catch {
      console.warn('Failed to configure cluster admin kubeconfig, continuing anyway');
    }
  } else {
    console.log(`Cluster '${clusterName}' not found, nothing to tear down`);
    setOutput('exists', 'false');
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
