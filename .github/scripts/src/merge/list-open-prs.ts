/**
 * List all open PRs targeting main and output their numbers as a JSON
 * array for downstream matrix consumption.
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY
 * Outputs (GITHUB_OUTPUT): pr_numbers (JSON array of numbers)
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { setOutput } from '../shared/output';

const main = async (): Promise<void> => {
  const { owner, repo } = getRepoContext();
  const octokit = new Octokit({ auth: requireEnv('GITHUB_TOKEN') });

  const prs = await octokit.paginate(octokit.pulls.list, {
    owner,
    repo,
    state: 'open',
    base: 'main',
    per_page: 100,
  });

  console.log(`Open PRs targeting main: ${prs.length}`);
  setOutput('pr_numbers', JSON.stringify(prs.map((pr) => pr.number)));
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
