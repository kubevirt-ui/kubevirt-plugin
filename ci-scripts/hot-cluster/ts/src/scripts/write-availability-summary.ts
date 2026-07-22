/**
 * Write a step summary for the cluster availability check.
 *
 * Required env: CLUSTER_NAME, PROBE_READY, PROVISION_RESULT
 */

import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const probeReady = process.env.PROBE_READY ?? '';
  const provisionResult = process.env.PROVISION_RESULT ?? '';

  const lines = [
    '## Cluster Availability Check',
    '',
    '| Check | Result |',
    '|-------|--------|',
    `| Cluster | \`${clusterName}\` |`,
    `| DNS Probe | \`${probeReady}\` |`,
  ];

  if (provisionResult !== 'skipped') {
    lines.push(`| Provision Job | \`${provisionResult}\` |`);
  }

  const summary = lines.join('\n') + '\n';
  console.log(summary);
  appendFileSync(process.env.GITHUB_STEP_SUMMARY!, summary);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
