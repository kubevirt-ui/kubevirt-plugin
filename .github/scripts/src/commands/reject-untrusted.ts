/**
 * Reject an untrusted commenter — reacts -1 and fails the step.
 *
 * Entry point: npx tsx src/commands/reject-untrusted.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, COMMENT_ID, COMMENT_AUTHOR, COMMAND
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { reactToComment } from '../shared/command-helpers';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const commentId = Number(requireEnv('COMMENT_ID'));
  const author = requireEnv('COMMENT_AUTHOR');
  const command = requireEnv('COMMAND');
  const octokit = new Octokit({ auth: token });

  await reactToComment(octokit, owner, repo, commentId, '-1');
  failStep(`${author} is not authorized to use ${command}`);
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
