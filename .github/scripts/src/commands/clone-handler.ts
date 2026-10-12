/**
 * Adapter for /clone command called by the dispatcher.
 * Fetches PR details (title, head SHA, base branch) and comment
 * author association that the clone module needs, then delegates.
 */

import type { CommandContext } from './dispatcher';

export const executeClone = async (ctx: CommandContext): Promise<void> => {
  const [{ data: pullRequest }, { data: comment }] = await Promise.all([
    ctx.octokit.pulls.get({ owner: ctx.owner, pull_number: ctx.prNumber, repo: ctx.repo }),
    ctx.octokit.issues.getComment({ comment_id: ctx.commentId, owner: ctx.owner, repo: ctx.repo }),
  ]);

  process.env.COMMENT_BODY = ctx.commentBody;
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.COMMENT_AUTHOR_ASSOCIATION = comment.author_association;
  process.env.PR_TITLE = pullRequest.title;
  process.env.HEAD_SHA = pullRequest.head.sha;
  process.env.MERGE_COMMIT_SHA = pullRequest.merge_commit_sha ?? '';
  process.env.BASE_BRANCH = pullRequest.base.ref;

  await import('../clone/index');
};
