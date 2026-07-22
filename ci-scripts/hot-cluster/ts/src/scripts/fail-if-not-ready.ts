/**
 * Fail the job if the cluster is not ready.
 *
 * Required env: CLUSTER_NAME, PROBE_READY, PROVISION_RESULT
 */

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const probeReady = process.env.PROBE_READY ?? '';
  const provisionResult = process.env.PROVISION_RESULT ?? '';

  throw new Error(
    `Cluster '${clusterName}' is not ready (probe=${probeReady}, provision=${provisionResult}).`,
  );
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
