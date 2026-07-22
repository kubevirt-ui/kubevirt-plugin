/**
 * Adapter for /clone command called by the dispatcher.
 * Delegates to the existing clone module.
 */

import type { CommandContext } from './dispatcher';

export const executeClone = async (ctx: CommandContext): Promise<void> => {
  process.env.COMMENT_BODY = ctx.commentBody;
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;

  const { main } = await import('../clone/index');
  if (typeof main === 'function') {
    await main();
  }
};
