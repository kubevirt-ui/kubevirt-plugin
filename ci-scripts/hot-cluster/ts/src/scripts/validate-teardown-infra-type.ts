/**
 * Guard against tearing down a cluster with the wrong `infrastructure_type`
 * input. ibmc-cluster-teardown.yml branches entirely on this human-supplied
 * value: selecting 'ipi' for what is actually a ROKS vpc/classic cluster
 * skips every ROKS-aware step (existence check, ARC deregistration, ROKS
 * cluster deletion) and falls into the IPI branch's unconditional
 * cleanup-vpc-resources.sh sweep instead -- which has no cluster-liveness
 * check of its own. That exact mistake deleted a live cluster's public
 * gateway, load balancer, and COS instance while leaving the ROKS cluster
 * itself (and its worker nodes) untouched. See
 * ci-scripts/hot-cluster/arc/README.md and the "Prevent Hot-Cluster
 * Teardown From Deleting Live Infra Again" postmortem for the full story.
 *
 * Detects the cluster's *actual* infra type the same way
 * check-cluster-exists.ts does and fails loudly on a mismatch --
 * intentionally even when `force: true`, since force is meant to bypass
 * the "CI is active" safety check, never a branch-selection mistake that
 * would skip the entire ROKS-deletion path.
 *
 * Required env: CLUSTER_NAME, INFRASTRUCTURE_TYPE
 * Optional env: BASE_DOMAIN (enables IPI detection via DNS)
 */

import { execSync } from 'node:child_process';
import dns from 'node:dns/promises';

import { requireEnv } from '../kube-client';

type DetectedInfraType = 'classic' | 'ipi' | 'vpc';

// Matches the exact substring ibmcloud prints for a confirmed-absent
// cluster, same as check-roks-exists-teardown.ts / delete-roks-cluster.ts.
const CLUSTER_NOT_FOUND_ERROR = 'could not be found';

const detectActualInfraType = async (
  clusterName: string,
  baseDomain: string,
): Promise<DetectedInfraType | null> => {
  let clusterGetOutput: string | null = null;
  try {
    // stdio captures stderr into the thrown error below instead of
    // discarding it via 2>/dev/null -- needed to tell a confirmed-absent
    // cluster apart from a genuine CLI/API/auth error.
    clusterGetOutput = execSync(`ibmcloud oc cluster get --cluster "${clusterName}" --output json`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    const execErr = err as { stderr?: string; stdout?: string };
    const output = `${execErr.stdout ?? ''}${execErr.stderr ?? ''}`;
    if (!output.includes(CLUSTER_NOT_FOUND_ERROR)) {
      // Ambiguous (CLI/API/auth hiccup, not a confirmed absence) -- never
      // treat this as "safe to fall through to IPI detection", since that
      // could silently let this whole validation pass with an
      // undetermined cluster type on a destructive teardown path.
      throw new Error(
        `'ibmcloud oc cluster get' failed with an unexpected error for '${clusterName}' -- refusing to assume it isn't a ROKS cluster: ${
          output || (err instanceof Error ? err.message : String(err))
        }`,
      );
    }
    // Confirmed not a ROKS cluster -- fall through to IPI detection.
  }

  if (clusterGetOutput) {
    const clusterJson = JSON.parse(clusterGetOutput) as { provider?: string };
    return clusterJson.provider === 'vpc-gen2' ? 'vpc' : 'classic';
  }

  if (baseDomain) {
    try {
      const addresses = await dns.resolve4(`api.${clusterName}.${baseDomain}`);
      if (addresses.length > 0) {
        return 'ipi';
      }
    } catch {
      // DNS does not resolve -- no IPI cluster by this name either.
    }
  }

  return null;
};

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const requestedType = requireEnv('INFRASTRUCTURE_TYPE');
  const baseDomain = process.env.BASE_DOMAIN ?? '';

  const actualType = await detectActualInfraType(clusterName, baseDomain);

  if (actualType === null) {
    console.log(
      `No live cluster found by the name '${clusterName}' (checked ROKS${baseDomain ? ' and IPI DNS' : ''}) -- nothing to validate.`,
    );
    return;
  }

  if (actualType !== requestedType) {
    console.error(
      `::error::infrastructure_type mismatch: '${clusterName}' is actually a '${actualType}' cluster, ` +
        `but teardown was requested with infrastructure_type='${requestedType}'. Proceeding would skip ` +
        `every ROKS-aware teardown step (gated on infrastructure_type != 'ipi') and fall through to an ` +
        `unconditional VPC-resource sweep with no cluster-liveness check -- exactly how a live cluster's ` +
        `public gateway, load balancer, and COS instance were previously deleted while the cluster itself ` +
        `kept running. Re-run with infrastructure_type='${actualType}'. This check is NOT bypassed by ` +
        `force=true -- force only skips the "CI is active" check, never an infra-type mismatch.`,
    );
    process.exit(1);
  }

  console.log(`infrastructure_type='${requestedType}' matches the detected cluster type. Proceeding.`);
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
