/**
 * Adapter for the validation commands (/lgtm, /approve, /hold, etc.)
 * called by the dispatcher. Delegates to the existing validation/commands module.
 */

import type { CommandContext } from './dispatcher';

export const executeValidationCommand = async (ctx: CommandContext): Promise<void> => {
  process.env.COMMENT_BODY = ctx.commentBody;
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;

  // The module self-executes via main().catch() at the bottom
  await import('../validation/commands/index');
};
