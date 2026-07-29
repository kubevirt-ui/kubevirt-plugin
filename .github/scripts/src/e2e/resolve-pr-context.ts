/**
 * Resolve a PR's current head SHA, mergeability, CI trust, and
 * merge-pool membership. Used by the pr_number retest path
 * (dispatched by on-main-push.yml after main advances, or
 * /retest-e2e's fallback dispatch).
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER
 * Optional env: SKIP_POOL_CHECK
 *
 * Outputs: head_sha, mergeable, still_in_pool, trusted
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { isMergePoolPr } from '../shared/merge-pool';
import { failStep, setOutput } from '../shared/output';
import { isListedInLocalOwners } from '../shared/owners';

const MERGEABLE_RETRIES = 5;
const MERGEABLE_DELAY_MS = 3000;

const fetchPrWithMergeability = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<Awaited<ReturnType<typeof octokit.pulls.get>>['data']> => {
  type PullData = Awaited<ReturnType<typeof octokit.pulls.get>>['data'];
  const attempts = Array.from({ length: MERGEABLE_RETRIES });
  const result = await attempts.reduce<Promise<PullData | undefined>>(async (prev, _attempt, i) => {
    const current = await prev;
    if (current?.mergeable !== null) {
      return current;
    }
    if (i > 0) {
      console.log(`PR #${prNumber} mergeable state not yet computed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, MERGEABLE_DELAY_MS));
    }
    const { data } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });
    return data;
  }, Promise.resolve(undefined));

  if (!result) {
    throw new Error(`Could not fetch PR #${prNumber} after ${MERGEABLE_RETRIES} attempts`);
  }
  return result;
};

const main = async (): Promise<void> => {
  const octokit = new Octokit({ auth: requireEnv('GITHUB_TOKEN') });
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const skipPoolCheck = process.env.SKIP_POOL_CHECK === 'true';

  const pullRequest = await fetchPrWithMergeability(octokit, owner, repo, prNumber);

  const author = pullRequest.user?.login ?? '';
  const ownedByAuthor = isListedInLocalOwners(author);
  const sameRepo = pullRequest.head.repo?.full_name === pullRequest.base.repo.full_name;
  const hasOkToTest = pullRequest.labels.some((label) => label.name === 'ok-to-test');
  const trusted = ownedByAuthor || sameRepo || hasOkToTest;
  const stillInPool = skipPoolCheck || isMergePoolPr(pullRequest.labels);

  console.log(
    `PR #${prNumber}: head=${pullRequest.head.sha}, mergeable=${pullRequest.mergeable}, ` +
      `mergeable_state=${pullRequest.mergeable_state}, still_in_pool=${stillInPool}` +
      `${skipPoolCheck ? ' (pool check skipped)' : ''}`,
  );
  console.log(
    `PR #${prNumber}: author=${author}, ownedByAuthor=${ownedByAuthor}, ` +
      `sameRepo=${sameRepo}, hasOkToTest=${hasOkToTest}, trusted=${trusted}`,
  );

  setOutput('head_sha', pullRequest.head.sha);
  setOutput('mergeable', pullRequest.mergeable === false ? 'false' : 'true');
  setOutput('still_in_pool', stillInPool ? 'true' : 'false');
  setOutput('trusted', trusted ? 'true' : 'false');
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
