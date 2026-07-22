/**
 * Shared helpers for PR comment command handlers.
 * Replaces ci-scripts/hot-cluster/js/pr-command-helpers.cjs.
 */

import { Octokit } from '@octokit/rest';

/** Best-effort emoji reaction on a comment. Never throws. */
export const reactToComment = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  commentId: number,
  content: '+1' | '-1' | 'laugh' | 'confused' | 'heart' | 'hooray' | 'rocket' | 'eyes',
): Promise<void> => {
  try {
    await octokit.reactions.createForIssueComment({
      owner,
      repo,
      comment_id: commentId,
      content,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not react to comment with "${content}": ${msg}`);
  }
};

/**
 * Enforce that a comment author is trusted (listed in OWNERS).
 * If untrusted, reacts -1 and returns false. Returns true if trusted.
 */
export const enforceCommentTrust = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  commentId: number,
  author: string,
  trusted: boolean,
  command: string,
): Promise<boolean> => {
  console.log(
    `${author} is ${trusted ? '' : 'not '}listed in OWNERS (approvers/reviewers) — ${trusted ? 'trusted' : `untrusted, ignoring ${command}`}.`,
  );

  if (!trusted) {
    await reactToComment(octokit, owner, repo, commentId, '-1');
    return false;
  }
  return true;
};
