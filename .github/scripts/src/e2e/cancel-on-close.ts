/**
 * Cancel E2E runs when a PR is closed/merged.
 * Entry point: npx tsx src/e2e/cancel-on-close.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const octokit = new Octokit({ auth: token });

  console.log(`PR #${prNumber} closed. Checking for pending E2E runs...`);

  const [inProgressRuns, queuedRuns] = await Promise.all([
    octokit.paginate(octokit.actions.listWorkflowRuns, {
      owner,
      repo,
      workflow_id: 'hot-cluster-e2e.yml',
      status: 'in_progress' as const,
      per_page: 100,
    }),
    octokit.paginate(octokit.actions.listWorkflowRuns, {
      owner,
      repo,
      workflow_id: 'hot-cluster-e2e.yml',
      status: 'queued' as const,
      per_page: 100,
    }),
  ]);

  const active = [...inProgressRuns, ...queuedRuns].filter((r) =>
    r.display_title?.includes(`@ PR#${prNumber} retest`),
  );

  if (active.length === 0) {
    console.log(`No in-progress hot-cluster-e2e runs found for PR #${prNumber}.`);
    return;
  }

  for (const run of active) {
    console.log(`Cancelling run ${run.id} (status: ${run.status})`);
    try {
      await octokit.actions.cancelWorkflowRun({ owner, repo, run_id: run.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Failed to cancel run ${run.id}: ${msg}`);
    }
  }
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
