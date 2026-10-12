/**
 * Resolve PR details for the Jira clone & cherry-pick workflow.
 * Outputs: title, head_sha, merge_commit_sha, base_branch.
 *
 * Entry point: npx tsx src/clone/resolve-pr-details.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, ISSUE_NUMBER
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { fetchPr } from '../shared/fetch-pr';
import { failStep, setOutput } from '../shared/output';

const main = async (): Promise<void> => {
  const octokit = new Octokit({ auth: requireEnv('GITHUB_TOKEN') });
  const { owner, repo } = getRepoContext();
  const pullRequest = await fetchPr(octokit, owner, repo, Number(requireEnv('ISSUE_NUMBER')));

  setOutput('title', pullRequest.title);
  setOutput('head_sha', pullRequest.headSha);
  setOutput('merge_commit_sha', pullRequest.mergeCommitSha);
  setOutput('base_branch', pullRequest.baseRef);
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
