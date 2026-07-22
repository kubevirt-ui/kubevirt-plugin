/**
 * Update the progress commit status to "pending / Running gating tests".
 * Best-effort follow-up to hot-cluster-e2e.yml's own progress update;
 * no-ops when the inputs are empty.
 *
 * Entry point: npx tsx src/e2e/progress-running.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID,
 *               STATUS_SHA, STATUS_CONTEXT
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext, getRunUrl } from '../shared/actions-context';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const runUrl = getRunUrl();
  const sha = requireEnv('STATUS_SHA');
  const statusContext = requireEnv('STATUS_CONTEXT');
  const octokit = new Octokit({ auth: token });

  await octokit.repos.createCommitStatus({
    owner,
    repo,
    sha,
    context: statusContext,
    state: 'pending',
    description: 'Running gating tests',
    target_url: runUrl,
  });
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
