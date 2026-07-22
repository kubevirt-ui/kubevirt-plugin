/**
 * Check if a ROKS cluster already exists.
 * Replaces: inline bash in ibmc-cluster-setup.yml
 *
 * Required env: CLUSTER_NAME
 * Output: exists=true|false
 */

import { appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const main = (): void => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const outputFile = process.env.GITHUB_OUTPUT;

  try {
    execSync(`ibmcloud oc cluster get --cluster "${clusterName}"`, { stdio: 'pipe' });
    console.log(`Cluster '${clusterName}' already exists`);
    if (outputFile) appendFileSync(outputFile, 'exists=true\n');
  } catch {
    console.log(`Cluster '${clusterName}' does not exist, will create`);
    if (outputFile) appendFileSync(outputFile, 'exists=false\n');
  }
};

main();
