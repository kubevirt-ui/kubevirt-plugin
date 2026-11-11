import type { ApprovalContext } from './approve';
import { denyCommand, reactToComment } from './approve';
import { isListedInOwners } from '../../shared/owners';
import { grantHold, revokeHold } from './review-labels';

/** /hold and /hold cancel: open to any root-OWNERS reviewer or approver. */
const requireRootOwnersMember = async (
  ctx: ApprovalContext,
  commandName: string,
): Promise<void> => {
  const trusted = await isListedInOwners(
    ctx.contentsOctokit,
    ctx.owner,
    ctx.repo,
    ctx.author,
    'OWNERS',
  );
  if (!trusted) {
    await denyCommand(
      ctx,
      commandName,
      `only root OWNERS reviewers or approvers can use \`${commandName}\`.`,
    );
  }
};

export const applyHold = async (ctx: ApprovalContext): Promise<void> => {
  await requireRootOwnersMember(ctx, '/hold');
  await grantHold(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);
  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
};

export const cancelHold = async (ctx: ApprovalContext): Promise<void> => {
  await requireRootOwnersMember(ctx, '/hold cancel');
  await revokeHold(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);
  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
};
