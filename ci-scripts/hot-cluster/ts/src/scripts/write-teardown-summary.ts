/**
 * Write the job summary for a manual console teardown run.
 *
 * Env: FOUND (true|false|empty), INSTANCE_KEY, CI_ENV_NS,
 *      CLUSTER_NAME, ACTOR
 */

import { appendFileSync } from 'node:fs';

const main = (): void => {
  const found = process.env.FOUND ?? '';
  const instanceKey = process.env.INSTANCE_KEY ?? '';
  const namespace = process.env.CI_ENV_NS ?? '';
  const clusterName = process.env.CLUSTER_NAME ?? '';
  const actor = process.env.ACTOR ?? '';

  const lines = [
    '## Manual Console Teardown',
    '',
    '| Field | Value |',
    '|---|---|',
    `| Instance key | \`${instanceKey}\` |`,
    `| ConfigMap | \`${namespace}/manual-console-${instanceKey}\` |`,
    `| Cluster | \`${clusterName}\` |`,
    `| Triggered by | @${actor} |`,
    '',
  ];

  if (found === 'true') {
    lines.push('Teardown requested; ci-env-controller reconciles this asynchronously.');
  } else if (found === 'false') {
    lines.push('No matching manual console was found -- nothing to tear down.');
  } else {
    lines.push(':x: Teardown request failed -- see logs above.');
  }

  const output = lines.join('\n');
  console.log(output);

  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) appendFileSync(summaryFile, output + '\n');
};

main();
