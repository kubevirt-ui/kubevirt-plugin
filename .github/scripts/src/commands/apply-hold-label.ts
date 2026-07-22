/**
 * Apply the e2e-hold label to a PR, creating it if it doesn't exist.
 *
 * Required env: PR_NUMBER
 * Optional env: BOT_TOKEN, GITHUB_TOKEN (falls back)
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { addLabel } from '../github-comments';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN || requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const octokit = new Octokit({ auth: token });

  await addLabel(octokit, owner, repo, prNumber, 'e2e-hold', {
    color: 'b60205',
    description: 'Hot Cluster E2E is on hold for this PR -- comment /retest-e2e to lift it',
  });
};

main().catch((err) => {
  console.error(
    '::warning::Could not apply the e2e-hold label:',
    err instanceof Error ? err.message : err,
  );
  console.error('::error::Failed to apply e2e-hold label');
  process.exit(1);
});
