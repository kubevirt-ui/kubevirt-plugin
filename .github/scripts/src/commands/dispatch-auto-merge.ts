/**
 * Wake Auto Merge after a human Approve review sync.
 * Entry point: npx tsx src/commands/dispatch-auto-merge.ts
 *
 * Required env: GITHUB_TOKEN (bot), PR_NUMBER, PR_HEAD_SHA, GITHUB_REPOSITORY
 *   or REPO_OWNER + REPO_NAME
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { dispatchAutoMerge } from '../validation/commands/bot-approve-review';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const headSha = requireEnv('PR_HEAD_SHA');
  const { owner, repo } = getRepoContext();

  await dispatchAutoMerge(new Octokit({ auth: token }), {
    headSha,
    owner,
    prNumber,
    repo,
  });
};

void main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
});
