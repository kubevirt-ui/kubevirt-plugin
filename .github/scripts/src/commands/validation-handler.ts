/**
 * Adapter for the validation commands (/lgtm, /approve, /hold, etc.)
 * called by the dispatcher. Fetches PR details the validation module
 * needs (title, base branch, head SHA, PR author), then delegates.
 */

import type { CommandContext } from './dispatcher';

export const executeValidationCommand = async (ctx: CommandContext): Promise<void> => {
  const { data: pr } = await ctx.octokit.pulls.get({
    owner: ctx.owner,
    repo: ctx.repo,
    pull_number: ctx.prNumber,
  });

  process.env.COMMENT_BODY = ctx.commentBody;
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.PR_TITLE = pr.title;
  process.env.BASE_BRANCH = pr.base.ref;
  process.env.PR_HEAD_SHA = pr.head.sha;
  process.env.PR_AUTHOR = pr.user?.login ?? '';

  await import('../validation/commands/index');
};
