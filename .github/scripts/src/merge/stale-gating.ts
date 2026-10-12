/**
 * List open PRs and classify merge-pool membership for stale-gating retests.
 * Entry point: npx tsx src/merge/stale-gating.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY
 *
 * Outputs: all_pr_numbers, pool_pr_numbers (JSON arrays)
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { isMergePoolPr } from '../shared/merge-pool';
import { failStep, setOutput } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const octokit = new Octokit({ auth: token });

  const prs = await octokit.paginate(octokit.pulls.list, {
    base: 'main',
    owner,
    per_page: 100,
    repo,
    state: 'open',
  });

  const all = prs.map((pullRequest) => pullRequest.number);
  const pool = prs
    .filter((pullRequest) => isMergePoolPr(pullRequest.labels))
    .map((pullRequest) => pullRequest.number);

  console.log(`Open PRs targeting main: ${all.length} total, ${pool.length} in the merge pool.`);
  console.log(`Pool PRs: ${pool.join(', ') || '(none)'}`);

  setOutput('all_pr_numbers', JSON.stringify(all));
  setOutput('pool_pr_numbers', JSON.stringify(pool));
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
