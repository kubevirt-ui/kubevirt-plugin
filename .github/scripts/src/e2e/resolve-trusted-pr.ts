/**
 * Resolve a PR's head SHA/repo and verify its author is listed in OWNERS
 * before any in-cluster build touches their code. Security-critical:
 * untrusted fork PRs must not run on self-hosted ARC runners.
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER
 *
 * Outputs: head_sha, head_repo
 * Fails the step if the author is not in OWNERS.
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { failStep, setOutput } from '../shared/output';
import { isListedInLocalOwners } from '../shared/owners';

const main = async (): Promise<void> => {
  const octokit = new Octokit({ auth: requireEnv('GITHUB_TOKEN') });
  const { owner, repo } = getRepoContext();
  const prNumberRaw = requireEnv('PR_NUMBER');
  const prNumber = parseInt(prNumberRaw, 10);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    failStep(`pr-number must be a positive integer, got '${prNumberRaw}'`);
  }

  const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });

  const author = pullRequest.user?.login ?? '';
  const headSha = pullRequest.head.sha;
  const headRepo = pullRequest.head.repo
    ? pullRequest.head.repo.full_name
    : '(source repository deleted)';

  console.log(`PR #${prNumber}: author=${author}, head=${headRepo}@${headSha}`);

  const trusted = isListedInLocalOwners(author);
  console.log(
    `${author} is ${trusted ? '' : 'not '}listed in OWNERS (approvers/reviewers) — ${trusted ? 'trusted' : 'untrusted'}.`,
  );

  setOutput('head_sha', headSha);
  setOutput('head_repo', headRepo);

  if (!trusted) {
    failStep(
      `PR #${prNumber}'s author '${author}' is not listed in OWNERS (approvers/reviewers). ` +
        'Only PRs from trusted repo owners can be built on a self-hosted runner via this workflow. ' +
        'To use this PR\'s changes anyway, push its branch to this repository directly and use the "branch" input instead.',
    );
  }
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
