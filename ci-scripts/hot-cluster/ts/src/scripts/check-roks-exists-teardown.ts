/**
 * Check whether a ROKS cluster exists and configure kubeconfig if it does.
 * Outputs `exists=true|false` to GITHUB_OUTPUT.
 *
 * Required env: CLUSTER_NAME
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';
import { setOutput } from '../utils';

// Substring IBM Cloud CLI prints when the cluster genuinely doesn't exist.
// Any other failure (network blip, auth hiccup, rate limit, ...) must NOT
// be treated as "cluster is gone" -- the VPC cleanup step that follows
// runs unconditionally for the vpc infra type, so silently assuming
// absence here could let it delete the subnet/VPC out from under a
// cluster that's still fully alive, without `cluster rm` ever being called.
const CLUSTER_NOT_FOUND_ERROR = 'could not be found';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');

  const exists = ((): boolean => {
    try {
      execSync(`ibmcloud oc cluster get --cluster "${clusterName}"`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      return true;
    } catch (err) {
      const execErr = err as { stderr?: string; stdout?: string };
      const output = `${execErr.stdout ?? ''}${execErr.stderr ?? ''}`;
      if (!output.includes(CLUSTER_NOT_FOUND_ERROR)) {
        throw new Error(
          `'ibmcloud oc cluster get' failed with an unexpected error -- refusing to assume cluster '${clusterName}' is gone:\n${output || String(err)}`,
        );
      }
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
