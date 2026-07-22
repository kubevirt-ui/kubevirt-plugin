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
import { setOutput, failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const issueNumber = Number(requireEnv('ISSUE_NUMBER'));
  const octokit = new Octokit({ auth: token });

  const { data: pr } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: issueNumber,
  });

  setOutput('title', pr.title);
  setOutput('head_sha', pr.head.sha);
  setOutput('merge_commit_sha', pr.merge_commit_sha || '');
  setOutput('base_branch', pr.base.ref);
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
