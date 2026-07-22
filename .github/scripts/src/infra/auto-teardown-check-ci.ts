/**
 * Auto-teardown: check CI activity for a cluster.
 * Entry point: npx tsx src/infra/auto-teardown-check-ci.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, CLUSTER_NAME, RUNNER_BUSY
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { setOutput, addStepSummary, failStep } from '../shared/output';
import { checkCIActivity } from './check-ci-activity';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const clusterName = requireEnv('CLUSTER_NAME');
  const runnerBusy = process.env.RUNNER_BUSY === 'true';
  const octokit = new Octokit({ auth: token });

  if (runnerBusy) {
    setOutput('active_jobs', 'true');
    setOutput('last_run_time', '');
    addStepSummary(`- Cluster: ${clusterName}\n- Runner pool busy: true (skipping teardown)`);
    return;
  }

  try {
    const result = await checkCIActivity(octokit, owner, repo, clusterName);

    const minutesAgo = result.lastRunTime
      ? Math.floor((Date.now() - new Date(result.lastRunTime).getTime()) / 60000)
      : 'N/A';

    addStepSummary([
      `- Cluster: ${clusterName}`,
      `- In-progress CI runs (tagged): ${result.inProgress}`,
      `- Queued CI runs (tagged): ${result.queued}`,
      `- Last tagged run: ${result.lastRunTime || 'N/A'} (${minutesAgo} minutes ago)`,
    ].join('\n'));

    setOutput('active_jobs', result.activeJobs ? 'true' : 'false');
    setOutput('last_run_time', result.lastRunTime);
  } catch (err) {
    failStep(`Failed to query workflow runs: ${err instanceof Error ? err.message : String(err)}`);
  }
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
