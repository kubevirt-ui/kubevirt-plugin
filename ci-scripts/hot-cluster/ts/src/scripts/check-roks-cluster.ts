/**
 * Check if a ROKS cluster already exists.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME
 * Output: exists=true|false
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

// Substring IBM Cloud CLI prints when the cluster genuinely doesn't exist.
// Any other failure (network blip, auth hiccup, rate limit, ...) must NOT
// be treated as "cluster doesn't exist" -- that would let this job go on
// to provision VPC resources and attempt a cluster create based on a
// guess, instead of surfacing the ambiguity as a hard failure.
const CLUSTER_NOT_FOUND_ERROR = 'could not be found';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const outputFile = process.env.GITHUB_OUTPUT;

  try {
    execSync(`ibmcloud oc cluster get --cluster "${clusterName}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log(`Cluster '${clusterName}' already exists`);
    if (outputFile) {
      appendFileSync(outputFile, 'exists=true\n');
    }
  } catch (err) {
    const execErr = err as { stderr?: string; stdout?: string };
    const output = `${execErr.stdout ?? ''}${execErr.stderr ?? ''}`;
    if (!output.includes(CLUSTER_NOT_FOUND_ERROR)) {
      throw new Error(
        `'ibmcloud oc cluster get' failed with an unexpected error -- refusing to assume cluster '${clusterName}' doesn't exist:\n${output || String(err)}`,
      );
    }
    console.log(`Cluster '${clusterName}' does not exist, will create`);
    if (outputFile) {
      appendFileSync(outputFile, 'exists=false\n');
    }
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
