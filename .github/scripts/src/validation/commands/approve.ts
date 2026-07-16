import type { Octokit } from '@octokit/rest';

import { AI_CONFIG } from '../ai-config-validation/constants';
import { CI_SCRIPTS_CONFIG } from '../ci-scripts-validation/constants';
import { isListedInOwners } from '../pr-path-validation/owners';
import { addLabel } from '../../github-comments';
import { safeErrorMessage, sameGitHubLogin } from '../../utils';
import { grantApprove, revokeApprove } from './review-labels';

export const reactToComment = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  commentId: number,
  content: '+1' | '-1',
): Promise<void> => {
  try {
    await octokit.reactions.createForIssueComment({
      owner,
      repo,
      comment_id: commentId,
      content,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Could not react to comment: ${safeErrorMessage(err)}`);
  }
};

/** React -1 and leave a short why-comment so the author isn't left guessing. */
export const denyCommand = async (
  ctx: Pick<ApprovalContext, 'octokit' | 'owner' | 'repo' | 'prNumber' | 'author' | 'commentId'>,
  commandName: string,
  reason: string,
): Promise<never> => {
  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '-1');
  try {
    await ctx.octokit.issues.createComment({
      owner: ctx.owner,
      repo: ctx.repo,
      issue_number: ctx.prNumber,
      body: `@${ctx.author}: ${reason}`,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Could not post denial comment: ${safeErrorMessage(err)}`);
  }
  throw new Error(`${ctx.author} is not authorized to use ${commandName}`);
};

export type ApprovalContext = {
  /** Bot token client -- used for labels/reactions/comments. */
  octokit: Octokit;
  /** Ambient token client -- only for reading .github/OWNERS ("Contents: read", a scope the bot app doesn't have). */
  contentsOctokit: Octokit;
  owner: string;
  repo: string;
  prNumber: number;
  baseBranch: string;
  author: string;
  commentId: number;
  /** PR author login -- /approve (like /lgtm) rejects self-use. */
  prAuthor: string;
};

/** Shared by /ai-approved and /ci-approved: OWNERS trust-check, then add the "reviewed" label. Both gate on the same .github/OWNERS approver group. */
const approveViaOwnersLabel = async (
  ctx: ApprovalContext,
  commandName: string,
  reviewedLabel: string,
  reviewedLabelMeta: { color: string; description: string },
): Promise<void> => {
  const trusted = await isListedInOwners(
    ctx.contentsOctokit,
    ctx.owner,
    ctx.repo,
    ctx.baseBranch,
    ctx.author,
  );

  // eslint-disable-next-line no-console
  console.log(
    `${ctx.author} is ${trusted ? '' : 'not '}listed in .github/OWNERS — ${trusted ? 'trusted' : `untrusted, ignoring ${commandName}`}.`,
  );

  if (!trusted) {
    await denyCommand(
      ctx,
      commandName,
      `only .github/OWNERS approvers can use \`${commandName}\`.`,
    );
  }

  await addLabel(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber, reviewedLabel, reviewedLabelMeta);
  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
  // eslint-disable-next-line no-console
  console.log(`Added ${reviewedLabel} label to PR #${ctx.prNumber}.`);
};

export const approveAiConfig = (ctx: ApprovalContext): Promise<void> =>
  approveViaOwnersLabel(ctx, '/ai-approved', AI_CONFIG.labels.reviewed, {
    color: '0e8a16',
    description: 'AI/editor configuration security review completed',
  });

export const approveCiScripts = (ctx: ApprovalContext): Promise<void> =>
  approveViaOwnersLabel(ctx, '/ci-approved', CI_SCRIPTS_CONFIG.labels.reviewed, {
    color: '0e8a16',
    description: 'CI configuration security review completed',
  });

export const isApprovalAuthError = (err: unknown, commandName: string): boolean =>
  err instanceof Error && err.message.includes(`not authorized to use ${commandName}`);

/** Shared by /approve and /approve cancel: gated to root OWNERS approvers only -- unlike /lgtm and /hold, which are open to any write-access collaborator. */
const requireRootOwnersApprover = async (
  ctx: ApprovalContext,
  commandName: string,
): Promise<void> => {
  const trusted = await isListedInOwners(
    ctx.contentsOctokit,
    ctx.owner,
    ctx.repo,
    ctx.baseBranch,
    ctx.author,
    'OWNERS',
  );

  if (!trusted) {
    await denyCommand(ctx, commandName, `only root OWNERS approvers can use \`${commandName}\`.`);
  }
};

/** /approve: root OWNERS approvers only; PR author cannot approve their own PR. */
export const applyApprove = async (ctx: ApprovalContext): Promise<void> => {
  if (sameGitHubLogin(ctx.author, ctx.prAuthor)) {
    await denyCommand(ctx, '/approve', 'you cannot `/approve` your own PR.');
  }
  await requireRootOwnersApprover(ctx, '/approve');
  await grantApprove(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);
  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
};

/** /approve cancel: same OWNERS gate as /approve (self-cancel allowed for OWNERS authors). */
export const cancelApprove = async (ctx: ApprovalContext): Promise<void> => {
  await requireRootOwnersApprover(ctx, '/approve cancel');
  await revokeApprove(ctx.octokit, ctx.owner, ctx.repo, ctx.prNumber);
  await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '+1');
};
