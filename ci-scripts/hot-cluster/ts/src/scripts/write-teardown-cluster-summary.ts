/**
 * Write the hot cluster teardown summary to GITHUB_STEP_SUMMARY.
 *
 * ibmc-cluster-teardown.yml previously called the manual-console
 * teardown's write-teardown-summary.ts here, which expects a different
 * set of env vars (FOUND, INSTANCE_KEY, CI_ENV_NS, ACTOR) and -- with
 * none of them set for this workflow -- always printed "Teardown request
 * failed", regardless of the actual outcome.
 *
 * Required env: CLUSTER_NAME, INFRASTRUCTURE_TYPE, CLUSTER_EXISTS
 */

import { requireEnv } from '../kube-client';
import { addStepSummary } from '../utils';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const infraType = requireEnv('INFRASTRUCTURE_TYPE');
  const clusterExists = requireEnv('CLUSTER_EXISTS');

  const lines = [
    '## Hot Cluster Teardown Summary',
    '',
    '| Field | Value |',
    '|---|---|',
    `| Cluster | \`${clusterName}\` |`,
    `| Infrastructure | \`${infraType}\` |`,
    `| Cluster existed before teardown | \`${clusterExists}\` |`,
  ];

  addStepSummary(lines.join('\n'));
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
