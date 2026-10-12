/**
 * Adapter for the validation commands (/lgtm, /approve, /hold, etc.)
 * called by the dispatcher. Fetches PR details the validation module
 * needs (title, base branch, head SHA, PR author), then delegates.
 */

import type { CommandContext } from './dispatcher';

import { main as runValidationCommands } from '../validation/commands/index';

export const executeValidationCommand = async (ctx: CommandContext): Promise<void> => {
  const { data: pullRequest } = await ctx.octokit.pulls.get({
    owner: ctx.owner,
    pull_number: ctx.prNumber,
    repo: ctx.repo,
  });

  process.env.COMMENT_BODY = ctx.commentBody;
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.PR_TITLE = pullRequest.title;
  process.env.BASE_BRANCH = pullRequest.base.ref;
  process.env.PR_HEAD_SHA = pullRequest.head.sha;
  process.env.PR_AUTHOR = pullRequest.user?.login ?? '';

  await runValidationCommands();
};
