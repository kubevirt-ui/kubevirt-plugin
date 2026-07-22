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
import { setOutput, failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const octokit = new Octokit({ auth: token });

  const prs = await octokit.paginate(octokit.pulls.list, {
    owner,
    repo,
    state: 'open',
    base: 'main',
    per_page: 100,
  });

  const all = prs.map((pr) => pr.number);
  const pool = prs.filter((pr) => isMergePoolPr(pr.labels)).map((pr) => pr.number);

  console.log(`Open PRs targeting main: ${all.length} total, ${pool.length} in the merge pool.`);
  console.log(`Pool PRs: ${pool.join(', ') || '(none)'}`);

  setOutput('all_pr_numbers', JSON.stringify(all));
  setOutput('pool_pr_numbers', JSON.stringify(pool));
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
