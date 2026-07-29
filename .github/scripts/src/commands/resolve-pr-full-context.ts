/**
 * Resolve full PR context — fetches the PR and outputs number, title,
 * base_ref, head_sha, and author.
 *
 * Entry point: npx tsx src/commands/resolve-pr-full-context.ts
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
  setOutput('title', pullRequest.title);
  setOutput('base_ref', pullRequest.baseRef);
  setOutput('head_sha', pullRequest.headSha);
  setOutput('author', pullRequest.author);
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
