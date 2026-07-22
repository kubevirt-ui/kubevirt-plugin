/**
 * Write a step summary for the manual health check result.
 *
 * Required env: CLUSTER_NAME, INFRASTRUCTURE_TYPE, JOB_STATUS
 */

import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const infraType = requireEnv('INFRASTRUCTURE_TYPE');
  const jobStatus = requireEnv('JOB_STATUS');

  const lines = [
    '## Manual Cluster Health Check',
    '',
    '| Parameter | Value |',
    '|-----------|-------|',
    `| Infrastructure | \`${infraType}\` |`,
    `| Cluster | \`${clusterName}\` |`,
    '',
  ];

  if (jobStatus === 'success') {
    lines.push('All health checks **passed**. Invoking Playwright gating tests on the hot cluster.');
  } else {
    lines.push('Health checks **failed**. E2E workflow was not invoked.');
  }

  const summary = lines.join('\n') + '\n';
  console.log(summary);
  appendFileSync(process.env.GITHUB_STEP_SUMMARY!, summary);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
