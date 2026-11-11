import { sameGitHubLogin } from '../../utils';
import { isListedInOwners as isRootOwnersMember } from '../../shared/owners';
import { isListedInOwners as isRootOwnersApprover } from '../pr-path-validation/owners';
import type { ApprovalContext } from './approve';
import { denyCommand, reactToComment } from './approve';
import { dispatchAutoMerge, ensureBotApprovingReview } from './bot-approve-review';
import { grantApprove, grantLgtm, revokeApprove, revokeLgtm } from './review-labels';

export type ReviewContext = ApprovalContext;

/** /lgtm: any root-OWNERS reviewer or approver except the PR's own author. Root approvers also get `approved`. */
export const applyLgtm = async (ctx: ReviewContext): Promise<void> => {
  if (sameGitHubLogin(ctx.author, ctx.prAuthor)) {
    await denyCommand(ctx, '/lgtm', 'you cannot `/lgtm` your own PR (you may use `/lgtm cancel`).');
  }

  const trusted = await isRootOwnersMember(
    ctx.contentsOctokit,
    ctx.owner,
    ctx.repo,
    ctx.author,
    'OWNERS',
  );
  if (!trusted) {
    await denyCommand(ctx, '/lgtm', 'only root OWNERS reviewers or approvers can use `/lgtm`.');
  }

  await grantLgtm(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);

  const isApprover = await isRootOwnersApprover(
    ctx.contentsOctokit,
    ctx.owner,
    ctx.repo,
    ctx.author,
    'OWNERS',
  );
  if (isApprover) {
    await grantApprove(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);
    const botApprove = await ensureBotApprovingReview(ctx.octokit, {
      author: ctx.author,
      command: '/lgtm',
      headSha: ctx.headSha,
      owner: ctx.owner,
      prNumber: ctx.prNumber,
      repo: ctx.repo,
    });
    if (botApprove !== 'failed') {
      await dispatchAutoMerge(ctx.octokit, {
        headSha: ctx.headSha,
        owner: ctx.owner,
        prNumber: ctx.prNumber,
        repo: ctx.repo,
      });
    }
  }

  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
};

/**
 * /lgtm cancel: any root-OWNERS reviewer or approver, including the PR's own
 * author. Always revokes `approved` too, regardless of whether *this*
 * actor is an OWNERS approver -- `approved` was only ever granted as part
 * of the same lgtm-acts-as-approve pairing, so it must not outlive the
 * `lgtm` that justified it just because a lower-trust actor is the one
 * lifting it.
 */
export const cancelLgtm = async (ctx: ReviewContext): Promise<void> => {
  const allowed =
    sameGitHubLogin(ctx.author, ctx.prAuthor) ||
    (await isRootOwnersMember(ctx.contentsOctokit, ctx.owner, ctx.repo, ctx.author, 'OWNERS'));

  if (!allowed) {
    await denyCommand(
      ctx,
      '/lgtm cancel',
      'only root OWNERS reviewers or approvers (or the PR author) can use `/lgtm cancel`.',
    );
  }

  await revokeLgtm(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);
  await revokeApprove(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);

  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
};
