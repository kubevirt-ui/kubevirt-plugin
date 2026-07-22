/**
 * Write a step summary table for a manual console deploy.
 *
 * Env: BRANCH, PR_NUMBER, HEAD_REPO, HEAD_SHA, CLUSTER_NAME,
 *      INSTANCE_KEY, INFRASTRUCTURE_TYPE, ACTOR
 */

import { appendFileSync } from 'node:fs';

const main = (): void => {
  const branch = process.env.BRANCH ?? '';
  const prNumber = process.env.PR_NUMBER ?? '';
  const headRepo = process.env.HEAD_REPO ?? '';
  const headSha = process.env.HEAD_SHA ?? '';
  const clusterName = process.env.CLUSTER_NAME ?? '';
  const instanceKey = process.env.INSTANCE_KEY ?? '';
  const infraType = process.env.INFRASTRUCTURE_TYPE ?? '';
  const actor = process.env.ACTOR ?? '';

  const lines: string[] = ['## Manual Console Deploy', '', '| Field | Value |', '|---|---|'];

  if (prNumber) {
    lines.push(`| PR | #${prNumber} (\`${headRepo}@${headSha}\`) |`);
  } else {
    lines.push(`| Branch | \`${branch}\` |`);
  }

  lines.push(`| Cluster | \`${clusterName}\` |`);
  lines.push(`| Instance key | \`${instanceKey}\` |`);
  lines.push(`| Infrastructure | \`${infraType}\` |`);
  lines.push(`| Triggered by | @${actor} |`);

  const output = lines.join('\n');
  console.log(output);

  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) appendFileSync(summaryFile, output + '\n');
};

main();
