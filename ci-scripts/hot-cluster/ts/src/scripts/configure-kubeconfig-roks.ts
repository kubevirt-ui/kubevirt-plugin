/**
 * Configure kubeconfig for a ROKS cluster and verify connectivity.
 * Runs `ibmcloud oc cluster config --admin`, then `oc cluster-info` and `oc get nodes`.
 *
 * Required env: CLUSTER_NAME
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');

  execSync(`ibmcloud oc cluster config --cluster "${clusterName}" --admin`, {
    stdio: 'inherit',
  });
  execSync('oc cluster-info', { stdio: 'inherit' });
  execSync('oc get nodes -o wide', { stdio: 'inherit' });
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
