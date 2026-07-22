/**
 * Probe DNS for an existing IPI cluster.
 * If api.<cluster>.<base_domain> resolves, the cluster already exists.
 * Replaces: inline bash in ibmc-cluster-setup.yml (precheck job)
 *
 * Required env: CLUSTER_NAME, INFRASTRUCTURE_TYPE, BASE_DOMAIN
 * Output: already_ready=true|false
 */

import { appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

const setOutput = (value: string): void => {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) appendFileSync(outputFile, `already_ready=${value}\n`);
};

const main = (): void => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const infraType = requireEnv('INFRASTRUCTURE_TYPE');
  const baseDomain = requireEnv('BASE_DOMAIN');

  if (infraType !== 'ipi') {
    setOutput('false');
    return;
  }

  const apiHost = `api.${clusterName}.${baseDomain}`;
  try {
    const result = execSync(`dig +short "${apiHost}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    if (result) {
      console.log(`Cluster '${clusterName}' is already reachable (${apiHost} resolves) — skipping provisioning.`);
      setOutput('true');
      return;
    }
  } catch { /* dig failed or host not found */ }

  setOutput('false');
};

main();
