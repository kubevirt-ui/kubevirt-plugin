import type { ApprovalContext } from './approve';
import { denyCommand, reactToComment } from './approve';
import { isWriteCollaborator } from './collaborator-trust';
import { grantHold, revokeHold } from './review-labels';

/** /hold and /hold cancel: open to any write-access repo collaborator. */
const requireWriteCollaborator = async (
  ctx: ApprovalContext,
  commandName: string,
): Promise<void> => {
  const collaborator = await isWriteCollaborator(ctx.octokit, ctx.owner, ctx.repo, ctx.author);
  if (!collaborator) {
    await denyCommand(
      ctx,
      commandName,
      `only write-access collaborators can use \`${commandName}\`.`,
    );
  }
};

export const applyHold = async (ctx: ApprovalContext): Promise<void> => {
  await requireWriteCollaborator(ctx, '/hold');
  await grantHold(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);
  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
};

export const cancelHold = async (ctx: ApprovalContext): Promise<void> => {
  await requireWriteCollaborator(ctx, '/hold cancel');
  await revokeHold(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);
  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
};
