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

  setOutput('number', String(pr.number));
  setOutput('base_ref', pr.base.ref);
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
