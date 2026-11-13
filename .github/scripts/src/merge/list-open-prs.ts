/**
 * List all open PRs targeting BASE_REF and output their numbers as a JSON
 * array for downstream matrix consumption.
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, BASE_REF
 * Outputs (GITHUB_OUTPUT): pr_numbers (JSON array of numbers)
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { failStep, setOutput } from '../shared/output';

const main = async (): Promise<void> => {
  const { owner, repo } = getRepoContext();
  const baseRef = requireEnv('BASE_REF');
  const octokit = new Octokit({ auth: requireEnv('GITHUB_TOKEN') });

  const prs = await octokit.paginate(octokit.pulls.list, {
    base: baseRef,
    owner,
    per_page: 100,
    repo,
    state: 'open',
  });

  console.log(`Open PRs targeting ${baseRef}: ${prs.length}`);
  setOutput('pr_numbers', JSON.stringify(prs.map((pullRequest) => pullRequest.number)));
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
