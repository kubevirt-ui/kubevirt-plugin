/**
 * Check whether a cluster exists (ROKS via ibmcloud, IPI via DNS).
 * Outputs `exists=true|false` and `infra_type=vpc|classic|ipi|""` to GITHUB_OUTPUT.
 *
 * Required env: CLUSTER_NAME
 * Optional env: BASE_DOMAIN (only needed for IPI DNS detection)
 */

import { execSync } from 'node:child_process';
import dns from 'node:dns/promises';

import { requireEnv } from '../kube-client';
import { setOutput } from '../utils';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const baseDomain = process.env.BASE_DOMAIN ?? '';

  // Try ROKS first
  try {
    execSync(`ibmcloud oc cluster get --cluster "${clusterName}"`, { stdio: 'pipe' });
    const clusterJson = JSON.parse(
      execSync(`ibmcloud oc cluster get --cluster "${clusterName}" --output json 2>/dev/null`, {
        encoding: 'utf8',
      }),
    ) as { provider?: string; state?: string };

    const state = clusterJson.state ?? 'unknown';
    const provider = clusterJson.provider ?? 'classic';
    console.log(`ROKS cluster '${clusterName}' exists (state: ${state}, provider: ${provider})`);

    const infraType = provider === 'vpc-gen2' ? 'vpc' : 'classic';
    setOutput('exists', 'true');
    setOutput('infra_type', infraType);
    return;
  } catch {
    // Not a ROKS cluster, try IPI
  }

  // Try IPI via DNS (only if BASE_DOMAIN is configured)
  if (baseDomain) {
    const apiHost = `api.${clusterName}.${baseDomain}`;
    try {
      const addresses = await dns.resolve4(apiHost);
      if (addresses.length > 0) {
        console.log(`IPI cluster detected via DNS (${apiHost} resolves)`);
        setOutput('exists', 'true');
        setOutput('infra_type', 'ipi');
        return;
      }
    } catch {
      // DNS does not resolve
    }
  }

  console.log(`No cluster '${clusterName}' found (ROKS or IPI), nothing to do`);
  setOutput('exists', 'false');
  setOutput('infra_type', '');
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
