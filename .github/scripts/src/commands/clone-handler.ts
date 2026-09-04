/**
 * Adapter for /clone command called by the dispatcher.
 * Fetches PR details (title, head SHA, base branch) and comment
 * author association that the clone module needs, then delegates.
 */

import { setupRepositoryForCherryPick } from '../clone/git-helpers';
import { runClone } from '../clone/index';
import type { CommandContext } from './dispatcher';

const CLONE_CMD_REGEX = /^\/clone\s+(release-\d+\.\d+)\s*$/m;

export const executeClone = async (ctx: CommandContext): Promise<void> => {
  const [{ data: pullRequest }, { data: comment }] = await Promise.all([
    ctx.octokit.pulls.get({ owner: ctx.owner, pull_number: ctx.prNumber, repo: ctx.repo }),
    ctx.octokit.issues.getComment({ comment_id: ctx.commentId, owner: ctx.owner, repo: ctx.repo }),
  ]);

  const token = process.env.BOT_TOKEN ?? process.env.GITHUB_TOKEN ?? '';
  if (!token) {
    throw new Error('Missing BOT_TOKEN or GITHUB_TOKEN for /clone');
  }

  const targetMatch = CLONE_CMD_REGEX.exec(ctx.commentBody);
  const targetBranch = targetMatch?.[1] ?? '';
  const commitSha = pullRequest.merge_commit_sha ?? pullRequest.head.sha;

  process.env.COMMENT_BODY = ctx.commentBody;
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.COMMENT_AUTHOR_ASSOCIATION = comment.author_association;
  process.env.PR_TITLE = pullRequest.title;
  process.env.HEAD_SHA = pullRequest.head.sha;
  process.env.MERGE_COMMIT_SHA = pullRequest.merge_commit_sha ?? '';
  process.env.BASE_BRANCH = pullRequest.base.ref;
  process.env.REPO_OWNER = ctx.owner;
  process.env.REPO_NAME = ctx.repo;
  process.env.GITHUB_TOKEN = token;

  if (targetBranch) {
    setupRepositoryForCherryPick({
      commitSha,
      owner: ctx.owner,
      repo: ctx.repo,
      targetBranch,
      token,
    });
  }

  await runClone();
};
