/**
 * Reset ok-to-test label on PR push (synchronize).
 * Entry point: npx tsx src/commands/ok-to-test-reset.ts
 *
 * Required env: BOT_TOKEN or GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { removeLabel } from '../github-comments';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN || requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const octokit = new Octokit({ auth: token });

  await removeLabel(octokit, owner, repo, prNumber, 'ok-to-test');
  console.log(`Removed ok-to-test label from PR #${prNumber}`);
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
