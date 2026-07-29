/**
 * Compute final cluster readiness from probe + provision results.
 * Outputs `cluster_ready=true|false` to GITHUB_OUTPUT.
 *
 * Required env: SHOULD_RUN, PROBE_READY, PROVISION_RESULT
 */

import { setOutput } from '../utils';

const main = async (): Promise<void> => {
  const shouldRun = process.env.SHOULD_RUN === 'true';
  const probeReady = process.env.PROBE_READY === 'true';
  const provisionResult = process.env.PROVISION_RESULT;

  const ready = shouldRun && (probeReady || provisionResult === 'success');

  console.log(
    `should_run=${shouldRun}, probe_ready=${probeReady}, provision_result=${provisionResult} → cluster_ready=${ready}`,
  );
  setOutput('cluster_ready', String(ready));
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
