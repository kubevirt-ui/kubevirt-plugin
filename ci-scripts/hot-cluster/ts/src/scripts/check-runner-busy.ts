/**
 * Check whether any self-hosted runner labelled with CLUSTER_NAME is currently busy.
 * Outputs `busy=true|false` to GITHUB_OUTPUT.
 *
 * Required env: CLUSTER_NAME, GITHUB_REPOSITORY
 * Optional env: GH_TOKEN (if missing, fails closed → busy=true)
 */

import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const ghToken = process.env.GH_TOKEN;

  if (!ghToken) {
    console.log(
      '::warning::ARC app token unavailable (see previous step) -- failing closed (treating as busy).',
    );
    appendFileSync(process.env.GITHUB_OUTPUT!, 'busy=true\n');
    return;
  }

  let runnersJson: string;
  try {
    runnersJson = execSync(
      `gh api "repos/${requireEnv('GITHUB_REPOSITORY')}/actions/runners?per_page=100"`,
      { encoding: 'utf8', env: { ...process.env, GH_TOKEN: ghToken } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(
      `::warning::Failed to query self-hosted runners: ${msg} -- failing closed (treating as busy).`,
    );
    appendFileSync(process.env.GITHUB_OUTPUT!, 'busy=true\n');
    return;
  }

  const data = JSON.parse(runnersJson) as {
    total_count: number;
    runners: Array<{ busy: boolean; labels?: Array<{ name: string }> }>;
  };

  const busy = data.runners.some((r) => r.busy && r.labels?.some((l) => l.name === clusterName));

  console.log(
    `Runner pool for '${clusterName}': ${busy ? 'busy' : 'idle'} (${data.total_count} total runners checked).`,
  );
  appendFileSync(process.env.GITHUB_OUTPUT!, `busy=${busy}\n`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
