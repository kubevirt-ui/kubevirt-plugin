/**
 * Determine the idle threshold (minutes) for a cluster.
 * Uses workflow_dispatch override if available, otherwise per-cluster defaults.
 * Outputs `minutes=<N>` to GITHUB_OUTPUT.
 *
 * Required env: CLUSTER_NAME, EVENT_NAME
 * Optional env: INPUT_IDLE_THRESHOLD
 */

import { requireEnv } from '../kube-client';
import { setOutput } from '../utils';

const MAIN_CLUSTER_NAME = 'kubevirt-plugin-ci';
const MAIN_CLUSTER_THRESHOLD = 240;
const RELEASE_BRANCH_THRESHOLD = 120;

const computeThreshold = (
  eventName: string,
  inputThreshold: string | undefined,
  clusterName: string,
): number => {
  if (eventName === 'workflow_dispatch' && inputThreshold) {
    console.log(`Using workflow_dispatch override: ${parseInt(inputThreshold, 10)} minutes`);
    return parseInt(inputThreshold, 10);
  }
  if (clusterName === MAIN_CLUSTER_NAME) {
    console.log(`Default/main cluster: ${MAIN_CLUSTER_THRESHOLD} minutes (4h)`);
    return MAIN_CLUSTER_THRESHOLD;
  }
  console.log(`Release-branch cluster: ${RELEASE_BRANCH_THRESHOLD} minutes (2h)`);
  return RELEASE_BRANCH_THRESHOLD;
};

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const eventName = requireEnv('EVENT_NAME');
  const inputThreshold = process.env.INPUT_IDLE_THRESHOLD;

  const minutes = computeThreshold(eventName, inputThreshold, clusterName);

  setOutput('minutes', String(minutes));
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
