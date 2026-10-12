/**
 * Resolve PR context — fetches the PR and outputs number and base_ref.
 *
 * Entry point: npx tsx src/commands/resolve-pr-context.ts
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

  setOutput('number', String(pullRequest.number));
  setOutput('base_ref', pullRequest.baseRef);
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
