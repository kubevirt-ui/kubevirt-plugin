/**
 * Auto-teardown: check idle threshold for a cluster.
 * Entry point: npx tsx src/infra/auto-teardown-check-idle.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, CLUSTER_NAME,
 *               LAST_RUN_TIME, IDLE_THRESHOLD_MINUTES
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { setOutput, failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const clusterName = requireEnv('CLUSTER_NAME');
  let lastRunTime = process.env.LAST_RUN_TIME ?? '';
  const threshold = parseInt(requireEnv('IDLE_THRESHOLD_MINUTES'), 10);
  const octokit = new Octokit({ auth: token });

  if (!lastRunTime) {
    console.log('No completed tagged CI runs found, checking cluster setup time as fallback...');

    try {
      const { data } = await octokit.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: 'ibmc-cluster-setup.yml',
        status: 'success',
        per_page: 10,
      });
      const match = data.workflow_runs.find(
        (r) => r.display_title?.includes(`[${clusterName}]`),
      );
      if (match) {
        lastRunTime = match.updated_at;
        console.log(`Using last successful setup run time for ${clusterName}: ${lastRunTime}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Failed to query setup runs: ${msg}`);
    }
  }

  if (!lastRunTime) {
    console.log('Cannot determine last activity time, skipping teardown for safety');
    setOutput('recent_activity', 'true');
    setOutput('reason', 'Cannot determine last activity timestamp');
    return;
  }

  const lastTime = new Date(lastRunTime);
  const idleMinutes = Math.floor((Date.now() - lastTime.getTime()) / 60000);

  console.log(`Cluster: ${clusterName}`);
  console.log(`Last activity: ${lastRunTime}`);
  console.log(`Idle for ${idleMinutes} minutes (threshold: ${threshold} minutes)`);

  if (idleMinutes >= threshold) {
    setOutput('recent_activity', 'false');
    setOutput('reason', `CI jobs have been idle for ${idleMinutes} minutes (threshold: ${threshold})`);
  } else {
    const remaining = threshold - idleMinutes;
    setOutput('recent_activity', 'true');
    setOutput('reason', `CI jobs last ran ${idleMinutes} minutes ago, ${remaining} minutes remaining before threshold`);
  }
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
