import type { Octokit } from '@octokit/rest';

import { revokeApprove, revokeLgtm } from '../commands/review-labels';
import { isListedInOwners } from '../pr-path-validation/owners';

/**
 * Mirrors Prow's `lgtm` plugin: a new push invalidates any prior review,
 * since `lgtm`/`approved` no longer reflect the current diff.
 *
 * Exception: when the PR author is listed in OWNERS, `approved` is kept.
 * The author *is* the approver, so their own push can't make their own
 * approval stale. `lgtm` is still removed because it represents a
 * *reviewer's* sign-off, which may genuinely need re-evaluation.
 *
 * Best-effort and idempotent (`removeLabel` no-ops on a missing label),
 * so it's safe to call on every `synchronize` regardless of whether
 * either label is present.
 *
 * The revokes run independently: a genuine failure removing one label
 * must not skip the attempt to remove the other.
 */
export const clearStaleApproval = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  prAuthor?: string,
  baseRef?: string,
): Promise<void> => {
  const authorIsApprover =
    prAuthor && baseRef && (await isListedInOwners(octokit, owner, repo, baseRef, prAuthor));

  if (authorIsApprover) {
    console.log(`Keeping approved label: PR author "${prAuthor}" is listed in OWNERS`);
  }

  const revokes: Promise<void>[] = [revokeLgtm(octokit, owner, repo, prNumber)];
  if (!authorIsApprover) {
    revokes.push(revokeApprove(octokit, owner, repo, prNumber));
  }

  const results = await Promise.allSettled(revokes);

  const failure = results.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );
  if (failure) {
    throw failure.reason;
  }
};
