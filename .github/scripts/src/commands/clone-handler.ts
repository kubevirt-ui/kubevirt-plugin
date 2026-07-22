/**
 * Adapter for /clone command called by the dispatcher.
 * Fetches PR details (title, head SHA, base branch) and comment
 * author association that the clone module needs, then delegates.
 */

import type { CommandContext } from './dispatcher';

export const executeClone = async (ctx: CommandContext): Promise<void> => {
  const [{ data: pr }, { data: comment }] = await Promise.all([
    ctx.octokit.pulls.get({ owner: ctx.owner, repo: ctx.repo, pull_number: ctx.prNumber }),
    ctx.octokit.issues.getComment({ owner: ctx.owner, repo: ctx.repo, comment_id: ctx.commentId }),
  ]);

  process.env.COMMENT_BODY = ctx.commentBody;
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.COMMENT_AUTHOR_ASSOCIATION = comment.author_association;
  process.env.PR_TITLE = pr.title;
  process.env.HEAD_SHA = pr.head.sha;
  process.env.MERGE_COMMIT_SHA = pr.merge_commit_sha ?? '';
  process.env.BASE_BRANCH = pr.base.ref;

  await import('../clone/index');
};
