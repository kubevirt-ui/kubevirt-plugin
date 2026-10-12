/**
 * Sync the needs-rebase label based on GitHub's computed mergeable state.
 * Replaces ci-scripts/hot-cluster/js/sync-needs-rebase-label.cjs.
 */

import { type Octokit } from '@octokit/rest';

import { addLabel, removeLabel } from '../github-comments';

import { NEEDS_REBASE_LABEL } from '../shared/merge-pool';

const LABEL_META = {
  color: 'e99695',
  description:
    'This PR has a merge conflict with its base branch -- rebase or merge the base branch in to resolve',
};
const COMMENT_MARKER = '<!-- needs-rebase-comment -->';

const hasMarkerComment = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<boolean> => {
  const comments = await octokit.paginate(octokit.issues.listComments, {
    issue_number: prNumber,
    owner,
    per_page: 100,
    repo,
  });
  return comments.some((comment) => (comment.body ?? '').includes(COMMENT_MARKER));
};

const deleteMarkerComments = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<void> => {
  const comments = await octokit.paginate(octokit.issues.listComments, {
    issue_number: prNumber,
    owner,
    per_page: 100,
    repo,
  });
  for (const comment of comments) {
    if (!(comment.body ?? '').includes(COMMENT_MARKER)) {
      continue;
    }
    try {
      await octokit.issues.deleteComment({ comment_id: comment.id, owner, repo });
    } catch (err) {
      if ((err as { status?: number }).status !== 404) {
        throw err;
      }
    }
  }
};

type SyncParams = {
  octokit: Octokit;
  owner: string;
  prNumber: number;
  repo: string;
};

/**
 * Sync the needs-rebase label for a single PR.
 * Returns 'applied' | 'removed' | 'skipped' | 'unchanged'.
 */
export const syncNeedsRebaseLabel = async ({
  octokit,
  owner,
  prNumber,
  repo,
}: SyncParams): Promise<'applied' | 'removed' | 'skipped' | 'unchanged'> => {
  const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });

  if (pullRequest.mergeable === null) {
    console.log(
      `PR #${prNumber}: mergeable state not yet computed by GitHub -- skipping this pass.`,
    );
    return 'skipped';
  }

  const currentlyHasLabel = (pullRequest.labels ?? []).some(
    (label) => label.name === NEEDS_REBASE_LABEL,
  );

  if (pullRequest.mergeable === false) {
    if (!currentlyHasLabel) {
      console.log(
        `PR #${prNumber}: has a merge conflict with '${pullRequest.base.ref}' -- applying '${NEEDS_REBASE_LABEL}'.`,
      );
      await addLabel(octokit, owner, repo, prNumber, NEEDS_REBASE_LABEL, LABEL_META);
    }

    if (!(await hasMarkerComment(octokit, owner, repo, prNumber))) {
      const body = [
        COMMENT_MARKER,
        `@${pullRequest.user?.login}: this PR has a merge conflict with the \`${pullRequest.base.ref}\` branch and needs a rebase (or merging \`${pullRequest.base.ref}\` into your branch) before it can be tested or merged.`,
        `The \`${NEEDS_REBASE_LABEL}\` label will be removed automatically once resolved.`,
      ].join('\n\n');

      await octokit.issues.createComment({ body, issue_number: prNumber, owner, repo });
    }

    return currentlyHasLabel ? 'unchanged' : 'applied';
  }

  if (currentlyHasLabel) {
    console.log(
      `PR #${prNumber}: no longer has a merge conflict -- removing '${NEEDS_REBASE_LABEL}'.`,
    );
    await removeLabel(octokit, owner, repo, prNumber, NEEDS_REBASE_LABEL);
  }

  await deleteMarkerComments(octokit, owner, repo, prNumber);
  return currentlyHasLabel ? 'removed' : 'unchanged';
};

export { COMMENT_MARKER };
export { NEEDS_REBASE_LABEL } from '../shared/merge-pool';
