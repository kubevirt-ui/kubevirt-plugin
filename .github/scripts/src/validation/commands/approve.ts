import type { Octokit } from '@octokit/rest';

import { AI_CONFIG } from '../ai-config-validation/constants';
import { CI_SCRIPTS_CONFIG } from '../ci-scripts-validation/constants';
import { isListedInOwners } from '../pr-path-validation/owners';
import { addLabel } from '../../github-comments';
import { safeErrorMessage } from '../../utils';

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

export type ApprovalContext = {
  /** Bot token client -- used for labels/reactions. */
  octokit: Octokit;
  /** Ambient token client -- only for reading .github/OWNERS ("Contents: read", a scope the bot app doesn't have). */
  contentsOctokit: Octokit;
  owner: string;
  repo: string;
  prNumber: number;
  baseBranch: string;
  author: string;
  commentId: number;
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
    await reactToComment(ctx.octokit, ctx.owner, ctx.repo, ctx.commentId, '-1');
    throw new Error(`${ctx.author} is not authorized to use ${commandName}`);
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
