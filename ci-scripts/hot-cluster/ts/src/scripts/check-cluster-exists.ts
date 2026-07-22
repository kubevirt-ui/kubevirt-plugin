/**
 * Check whether a cluster exists (ROKS via ibmcloud, IPI via DNS).
 * Outputs `exists=true|false` and `infra_type=vpc|classic|ipi|""` to GITHUB_OUTPUT.
 *
 * Required env: CLUSTER_NAME, BASE_DOMAIN
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import dns from 'node:dns/promises';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const baseDomain = requireEnv('BASE_DOMAIN');
  let infraType = '';

  // Try ROKS first
  try {
    execSync(`ibmcloud oc cluster get --cluster "${clusterName}"`, { stdio: 'pipe' });
    const clusterJson = JSON.parse(
      execSync(`ibmcloud oc cluster get --cluster "${clusterName}" --output json 2>/dev/null`, {
        encoding: 'utf8',
      }),
    ) as { state?: string; provider?: string };

    const state = clusterJson.state ?? 'unknown';
    const provider = clusterJson.provider ?? 'classic';
    console.log(`ROKS cluster '${clusterName}' exists (state: ${state}, provider: ${provider})`);

    infraType = provider === 'vpc-gen2' ? 'vpc' : 'classic';
    appendFileSync(process.env.GITHUB_OUTPUT!, 'exists=true\n');
    appendFileSync(process.env.GITHUB_OUTPUT!, `infra_type=${infraType}\n`);
    return;
  } catch {
    // Not a ROKS cluster, try IPI
  }

  // Try IPI via DNS
  const apiHost = `api.${clusterName}.${baseDomain}`;
  try {
    const addresses = await dns.resolve4(apiHost);
    if (addresses.length > 0) {
      console.log(`IPI cluster detected via DNS (${apiHost} resolves)`);
      appendFileSync(process.env.GITHUB_OUTPUT!, 'exists=true\n');
      appendFileSync(process.env.GITHUB_OUTPUT!, 'infra_type=ipi\n');
      return;
    }
  } catch {
    // DNS does not resolve
  }

  console.log(`No cluster '${clusterName}' found (ROKS or IPI), nothing to do`);
  appendFileSync(process.env.GITHUB_OUTPUT!, 'exists=false\n');
  appendFileSync(process.env.GITHUB_OUTPUT!, `infra_type=\n`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
