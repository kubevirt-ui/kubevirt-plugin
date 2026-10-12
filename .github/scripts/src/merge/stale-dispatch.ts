/**
 * Dispatch a retest for a merge-pool PR after main advances.
 * Entry point: npx tsx src/merge/stale-dispatch.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const octokit = new Octokit({ auth: token });

  const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });

  await dispatchWorkflow(octokit, {
    inputs: {
      base_ref: pullRequest.base.ref,
      is_pool_retest: 'true',
      pr_number: String(prNumber),
    },
    owner,
    ref: 'main',
    repo,
    workflowId: 'hot-cluster-e2e.yml',
  });

  console.log(
    `PR #${prNumber}: dispatched a real retest against the new main tip (base_ref=${pullRequest.base.ref}).`,
  );
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
