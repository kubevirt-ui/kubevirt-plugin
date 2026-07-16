import type { ApprovalContext } from './approve';
import { denyCommand, reactToComment } from './approve';
import { isWriteCollaborator } from './collaborator-trust';
import { isListedInOwners } from '../pr-path-validation/owners';
import { grantApprove, grantLgtm, revokeApprove, revokeLgtm } from './review-labels';
import { sameGitHubLogin } from '../../utils';

export type ReviewContext = ApprovalContext;

/** /lgtm: any write-access collaborator except the PR's own author. Also grants `approved` when the actor is a root-OWNERS approver, so they don't need to separately /approve. */
export const applyLgtm = async (ctx: ReviewContext): Promise<void> => {
  if (sameGitHubLogin(ctx.author, ctx.prAuthor)) {
    await denyCommand(ctx, '/lgtm', 'you cannot `/lgtm` your own PR (you may use `/lgtm cancel`).');
  }

  const collaborator = await isWriteCollaborator(ctx.octokit, ctx.owner, ctx.repo, ctx.author);
  if (!collaborator) {
    await denyCommand(ctx, '/lgtm', 'only write-access collaborators can use `/lgtm`.');
  }

  await grantLgtm(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);

  const isApprover = await isListedInOwners(
    ctx.contentsOctokit,
    ctx.owner,
    ctx.repo,
    ctx.baseBranch,
    ctx.author,
    'OWNERS',
  );
  if (isApprover) {
    await grantApprove(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);
  }

  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
};

/**
 * /lgtm cancel: any write-access collaborator, including the PR's own
 * author. Always revokes `approved` too, regardless of whether *this*
 * actor is an OWNERS approver -- `approved` was only ever granted as part
 * of the same lgtm-acts-as-approve pairing, so it must not outlive the
 * `lgtm` that justified it just because a lower-trust actor is the one
 * lifting it.
 */
export const cancelLgtm = async (ctx: ReviewContext): Promise<void> => {
  const allowed =
    sameGitHubLogin(ctx.author, ctx.prAuthor) ||
    (await isWriteCollaborator(ctx.octokit, ctx.owner, ctx.repo, ctx.author));

  if (!allowed) {
    await denyCommand(
      ctx,
      '/lgtm cancel',
      'only write-access collaborators (or the PR author) can use `/lgtm cancel`.',
    );
  }

  await revokeLgtm(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);
  await revokeApprove(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);

  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
};
