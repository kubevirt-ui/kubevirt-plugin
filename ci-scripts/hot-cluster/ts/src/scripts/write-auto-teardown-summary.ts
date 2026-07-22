/**
 * Write a step summary for the auto-teardown check.
 *
 * Required env: CLUSTER_NAME, IDLE_THRESHOLD_MINUTES
 * Optional env: CLUSTER_EXISTS, WORKFLOW_ACTIVE_JOBS, WORKFLOW_LAST_RUN_TIME,
 *               IDLE_RECENT_ACTIVITY, IDLE_REASON, BUSINESS_HOURS_SKIP
 */

import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const idleThreshold = process.env.IDLE_THRESHOLD_MINUTES ?? '';
  const clusterExists = process.env.CLUSTER_EXISTS ?? '(unknown)';
  const activeJobs = process.env.WORKFLOW_ACTIVE_JOBS ?? 'N/A';
  const lastRunTime = process.env.WORKFLOW_LAST_RUN_TIME ?? 'N/A';
  const recentActivity = process.env.IDLE_RECENT_ACTIVITY ?? 'N/A';
  const reason = process.env.IDLE_REASON ?? 'N/A';
  const businessHoursSkip = process.env.BUSINESS_HOURS_SKIP ?? 'N/A';

  const lines = [
    `## Auto-Teardown Check: ${clusterName}`,
    '',
    '| Check | Result |',
    '|-------|--------|',
    `| Cluster | \`${clusterName}\` |`,
    `| Idle Threshold | \`${idleThreshold}\` min |`,
    `| Business Hours Skip | \`${businessHoursSkip}\` |`,
    `| Cluster Exists | \`${clusterExists}\` |`,
    `| Active CI Jobs? | \`${activeJobs}\` |`,
    `| Last CI Run | \`${lastRunTime}\` |`,
    `| Recent Activity? | \`${recentActivity}\` |`,
    `| Reason | \`${reason}\` |`,
  ];

  const summary = lines.join('\n') + '\n';
  console.log(summary);
  appendFileSync(process.env.GITHUB_STEP_SUMMARY!, summary);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
