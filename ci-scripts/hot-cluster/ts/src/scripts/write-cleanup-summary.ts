/**
 * Write the IBM Cloud Resource Cleanup step summary.
 *
 * Required env: CLUSTER_NAME, DRY_RUN
 * Optional env: MATCHED_CLUSTERS, MATCHED_COUNT, DETECTION_AVAILABLE,
 *               CLEAN_VPC, EXPECTED_CLUSTER_COUNT
 */

import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const dryRun = requireEnv('DRY_RUN');
  const matchedClusters = process.env.MATCHED_CLUSTERS ?? 'unavailable';
  const matchedCount = process.env.MATCHED_COUNT ?? 'N/A';
  const detectionAvailable = process.env.DETECTION_AVAILABLE ?? '';
  const cleanVpc = process.env.CLEAN_VPC ?? 'false';
  const expectedCount = process.env.EXPECTED_CLUSTER_COUNT ?? '1';

  const lines = [
    '## IBM Cloud Resource Cleanup',
    '',
    '| Setting | Value |',
    '|---------|-------|',
    `| Cluster prefix | \`${clusterName}\` |`,
    `| Dry run | \`${dryRun}\` |`,
    `| Clean VPC | \`${cleanVpc}\` |`,
    `| Detected distinct clusters | \`${matchedCount} (${matchedClusters})\` |`,
    `| Expected cluster count | \`${expectedCount}\` |`,
    '',
  ];

  if (detectionAvailable !== 'true') {
    lines.push(
      '⚠️ Cluster-count/active-job safety checks were **skipped** (detection unavailable — no CIS instance and no matching ROKS clusters found).',
    );
  }

  if (dryRun === 'true') {
    lines.push('**Dry run** — no resources were deleted. Set dry_run to false to delete.');
  } else {
    lines.push(`Resources matching \`${clusterName}\` have been **deleted**.`);
  }

  appendFileSync(process.env.GITHUB_STEP_SUMMARY!, lines.join('\n') + '\n');
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
