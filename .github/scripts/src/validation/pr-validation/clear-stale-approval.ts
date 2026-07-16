import type { Octokit } from '@octokit/rest';

import { revokeApprove, revokeLgtm } from '../commands/review-labels';

/**
 * Mirrors Prow's `lgtm` plugin: a new push invalidates any prior review,
 * since `lgtm`/`approved` no longer reflect the current diff. Removes both
 * together (not just `lgtm`) since an OWNERS approver's `/lgtm` already
 * grants `approved` alongside it -- same pairing, reversed. Best-effort and
 * idempotent (`removeLabel` no-ops on a missing label), so it's safe to call
 * on every `synchronize` regardless of whether either label is present.
 *
 * The two revokes run independently: a genuine failure removing one label
 * must not skip the attempt to remove the other.
 */
export const clearStaleApproval = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<void> => {
  const results = await Promise.allSettled([
    revokeLgtm(octokit, owner, repo, prNumber),
    revokeApprove(octokit, owner, repo, prNumber),
  ]);

  const failure = results.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );
  if (failure) {
    throw failure.reason;
  }
};
