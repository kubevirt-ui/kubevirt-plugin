/**
 * Adapter for the validation commands (/lgtm, /approve, /hold, etc.)
 * called by the dispatcher. Delegates to the existing validation/commands module.
 */

import type { CommandContext } from './dispatcher';

export const executeValidationCommand = async (ctx: CommandContext): Promise<void> => {
  // Set env vars the existing validation module expects
  process.env.COMMENT_BODY = ctx.commentBody;
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;

  const { main } = await import('../validation/commands/index');
  if (typeof main === 'function') {
    await main();
  }
};
