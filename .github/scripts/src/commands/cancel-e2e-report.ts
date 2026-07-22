/**
 * /cancel-e2e report — posts the cancellation outcome comment.
 * Runs in a separate job after the concurrency group cancellation jobs.
 *
 * Entry point: npx tsx src/commands/cancel-e2e-report.ts
 *
 * Required env: BOT_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, WAS_RUNNING
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN || requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const wasRunning = process.env.WAS_RUNNING === 'true';
  const octokit = new Octokit({ auth: token });

  const body = wasRunning
    ? '🛑 Cancelled the in-progress Hot Cluster E2E run for this PR -- comment `/retest-e2e` for a fresh result.'
    : 'ℹ️ No Hot Cluster E2E run was in progress for this PR -- nothing to cancel.';

  try {
    await octokit.issues.createComment({ owner, repo, issue_number: prNumber, body });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not comment cancellation outcome: ${msg}`);
  }
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
