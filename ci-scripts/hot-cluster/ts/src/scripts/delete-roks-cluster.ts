/**
 * Delete a ROKS cluster on job failure, then wait until IBM Cloud confirms
 * it is fully gone. `cluster rm` itself returns in seconds, well before
 * worker VSIs are detached from the VPC subnet -- without this wait, a
 * following VPC resource sweep races the still-draining IKS worker nodes
 * and fails to delete the subnet/VPC (subnet_in_use_iks_worker_node_exists).
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME
 */

import { execSync } from 'node:child_process';

import { requireEnv, sleep } from '../kube-client';

const POLL_INTERVAL_MS = 30_000;
const POLL_BUDGET_MS = 40 * 60 * 1000;

// Substring IBM Cloud CLI prints when the cluster genuinely doesn't exist.
// Any other failure (network blip, auth hiccup, rate limit, ...) must NOT
// be treated as "cluster is gone" -- that would skip deletion entirely or
// end the drain-wait poll early while the cluster (and its worker nodes
// holding the VPC subnet) is still very much there.
const CLUSTER_NOT_FOUND_ERROR = 'could not be found';

const clusterExists = (clusterName: string): boolean => {
  try {
    execSync(`ibmcloud oc cluster get --cluster "${clusterName}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return true;
  } catch (err) {
    const execErr = err as { stderr?: string; stdout?: string };
    const output = `${execErr.stdout ?? ''}${execErr.stderr ?? ''}`;
    if (output.includes(CLUSTER_NOT_FOUND_ERROR)) {
      return false;
    }
    console.log(
      `WARNING: 'ibmcloud oc cluster get' failed with an unexpected error; assuming the cluster still exists:\n${output || String(err)}`,
    );
    return true;
  }
};

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');

  if (!clusterExists(clusterName)) {
    console.log(`Cluster '${clusterName}' not found, nothing to delete.`);
    return;
  }

  console.log(`Job failed — deleting ROKS cluster '${clusterName}'...`);
  try {
    execSync(`ibmcloud oc cluster rm --cluster "${clusterName}" -f --force-delete-storage`, {
      stdio: 'inherit',
    });
  } catch {
    console.log('WARNING: cluster deletion request failed');
    return;
  }

  console.log(
    `Waiting up to ${POLL_BUDGET_MS / 60_000} minutes for cluster '${clusterName}' to be fully removed (worker nodes must drain from the VPC subnet before it can be deleted)...`,
  );
  const deadline = Date.now() + POLL_BUDGET_MS;
  while (Date.now() < deadline) {
    if (!clusterExists(clusterName)) {
      console.log(`Cluster '${clusterName}' is gone.`);
      return;
    }
    await sleep(Math.min(POLL_INTERVAL_MS, deadline - Date.now()));
  }

  console.log(
    `WARNING: cluster '${clusterName}' still present after ${POLL_BUDGET_MS / 60_000} minutes; continuing anyway -- the VPC sweep's own subnet/VPC retries will catch any lingering IKS worker nodes.`,
  );
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
