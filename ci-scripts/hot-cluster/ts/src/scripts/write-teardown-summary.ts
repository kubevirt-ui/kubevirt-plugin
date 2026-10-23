/**
 * Write the job summary for a manual console teardown run.
 *
 * Env: FOUND (true|false|unknown|empty), ORPHANS_CLEANED (true|false|empty),
 *      ORPHANS_INCOMPLETE (true|false|empty), INSTANCE_KEY, CI_ENV_NS,
 *      CLUSTER_NAME, ACTOR
 */

import { appendFileSync } from 'node:fs';

const main = async (): Promise<void> => {
  const found = process.env.FOUND ?? '';
  const orphansCleaned = process.env.ORPHANS_CLEANED ?? '';
  const orphansIncomplete = process.env.ORPHANS_INCOMPLETE ?? '';
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
    if (orphansCleaned === 'true') {
      lines.push(
        'Also removed leftover ImageStream / BuildConfig (and any stray Helm release) for this instance.',
      );
    }
  } else if (found === 'unknown') {
    lines.push(
      ':warning: Could not confirm ConfigMap teardown (lookup or patch failed). ' +
        'See the teardown step log -- do not assume the instance is absent.',
    );
    if (orphansCleaned === 'true') {
      lines.push(
        'Removed leftover ImageStream / BuildConfig (and any stray Helm release) for this instance where possible.',
      );
    }
  } else if (found === 'false' && orphansIncomplete === 'true') {
    // Prefer incomplete over "were removed" when both cleaned and failed.
    lines.push(
      'No trigger ConfigMap was present, and orphan cleanup did not fully succeed -- see the teardown step log.',
    );
  } else if (found === 'false' && orphansCleaned === 'true') {
    lines.push(
      'No trigger ConfigMap was present (deploy likely failed before provisioning), ' +
        'but leftover ImageStream / BuildConfig / Helm release for this instance were removed.',
    );
  } else if (found === 'false') {
    lines.push('No matching manual console was found -- nothing to tear down.');
  } else {
    lines.push(':x: Teardown request failed -- see logs above.');
  }

  if (orphansIncomplete === 'true') {
    lines.push('');
    lines.push(
      ':x: Orphan cleanup was **incomplete** -- some ImageStream / BuildConfig / Helm deletions failed. See the teardown step log.',
    );
  }

  const output = lines.join('\n');
  console.log(output);

  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    appendFileSync(summaryFile, output + '\n');
  }
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
