/**
 * /hold-e2e check step — resolve PR head, enforce trust, react.
 * The label application, concurrency cancellation, check-run marking,
 * and reporting stay as separate YAML jobs (they need concurrency groups
 * and separate bot tokens).
 *
 * Entry point: npx tsx src/commands/hold-e2e.ts
 *
 * Required env: BOT_TOKEN or GITHUB_TOKEN, GITHUB_REPOSITORY,
 *               PR_NUMBER, COMMENT_ID, COMMENT_AUTHOR, TRUSTED
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { reactToComment, enforceCommentTrust } from '../shared/command-helpers';
import { setOutput, failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN || requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const commentId = Number(requireEnv('COMMENT_ID'));
  const author = requireEnv('COMMENT_AUTHOR');
  const trusted = process.env.TRUSTED === 'true';
  const octokit = new Octokit({ auth: token });

  if (!(await enforceCommentTrust(octokit, owner, repo, commentId, author, trusted, '/hold-e2e'))) {
    setOutput('head_sha', '');
    return;
  }

  const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
  console.log(`/hold-e2e requested by ${author} on PR #${prNumber} (HEAD: ${pr.head.sha})`);

  await reactToComment(octokit, owner, repo, commentId, 'eyes');
  setOutput('head_sha', pr.head.sha);
};

import type { CommandContext } from './dispatcher';
import { addLabel } from '../github-comments';

/** Called by the dispatcher. Returns head SHA for the mark-held job. */
export const executeHoldE2E = async (ctx: CommandContext): Promise<string> => {
  const { data: pr } = await ctx.octokit.pulls.get({
    owner: ctx.owner,
    repo: ctx.repo,
    pull_number: ctx.prNumber,
  });
  console.log(`/hold-e2e requested by ${ctx.author} on PR #${ctx.prNumber} (HEAD: ${pr.head.sha})`);
  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, 'eyes');

  // Apply e2e-hold label
  await addLabel(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber, 'e2e-hold', {
    color: 'b60205',
    description: 'Hot Cluster E2E is on hold for this PR -- comment /retest-e2e to lift it',
  });

  setOutput('head_sha', pr.head.sha);
  return pr.head.sha;
};

if (require.main === module) {
  main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
