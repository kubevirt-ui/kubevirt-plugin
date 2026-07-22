/**
 * Determine the idle threshold (minutes) for a cluster.
 * Uses workflow_dispatch override if available, otherwise per-cluster defaults.
 * Outputs `minutes=<N>` to GITHUB_OUTPUT.
 *
 * Required env: CLUSTER_NAME, EVENT_NAME
 * Optional env: INPUT_IDLE_THRESHOLD
 */

import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const MAIN_CLUSTER_NAME = 'kubevirt-plugin-ci';
const MAIN_CLUSTER_THRESHOLD = 240;
const RELEASE_BRANCH_THRESHOLD = 120;

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const eventName = requireEnv('EVENT_NAME');
  const inputThreshold = process.env.INPUT_IDLE_THRESHOLD;

  let minutes: number;

  if (eventName === 'workflow_dispatch' && inputThreshold) {
    minutes = parseInt(inputThreshold, 10);
    console.log(`Using workflow_dispatch override: ${minutes} minutes`);
  } else if (clusterName === MAIN_CLUSTER_NAME) {
    minutes = MAIN_CLUSTER_THRESHOLD;
    console.log(`Default/main cluster: ${minutes} minutes (4h)`);
  } else {
    minutes = RELEASE_BRANCH_THRESHOLD;
    console.log(`Release-branch cluster: ${minutes} minutes (2h)`);
  }

  appendFileSync(process.env.GITHUB_OUTPUT!, `minutes=${minutes}\n`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
