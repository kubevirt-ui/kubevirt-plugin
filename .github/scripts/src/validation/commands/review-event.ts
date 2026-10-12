// Entrypoint for pr_review_commands.yml -- an Approve/Request-changes
// review toggles lgtm/approved the same way the /lgtm command does. No PR
// comment/reaction is posted (reviews don't support reactions) -- a
// routine skip just logs and exits normally rather than failing the job.
import type { Octokit } from '@octokit/rest';

import { createOctokit, createStatusOctokit } from '../../github-repo';
import type { GitHubConfig } from '../../types/index';
import { requireEnv, safeErrorMessage, sameGitHubLogin } from '../../utils';
import { isListedInOwners } from '../pr-path-validation/owners';
import { isWriteCollaborator } from './collaborator-trust';
import { grantApprove, grantLgtm, revokeApprove, revokeLgtm } from './review-labels';

export type ReviewSyncResult = 'applied' | 'revoked' | 'skipped';

export type SyncLabelsFromReviewArgs = {
  baseBranch: string;
  contentsOctokit: Octokit;
  octokit: Octokit;
  owner: string;
  prAuthor: string;
  prNumber: number;
  repo: string;
  reviewAuthor: string;
  reviewState: 'APPROVED' | 'CHANGES_REQUESTED';
};

/** Core logic for pr_review_commands.yml -- exported for unit tests. */
export const syncLabelsFromReview = async (
  args: SyncLabelsFromReviewArgs,
): Promise<ReviewSyncResult> => {
  const {
    baseBranch,
    contentsOctokit,
    octokit,
    owner,
    prAuthor,
    prNumber,
    repo,
    reviewAuthor,
    reviewState,
  } = args;

  // A self-review should never grant lgtm/approved.
  if (sameGitHubLogin(reviewAuthor, prAuthor)) {
    console.log(
      `${reviewAuthor} reviewed their own PR -- self-review never toggles lgtm/approved.`,
    );
    return 'skipped';
  }

  const collaborator = await isWriteCollaborator(octokit, owner, repo, reviewAuthor);
  if (!collaborator) {
    console.log(
      `${reviewAuthor} is not a write-access collaborator -- this review doesn't toggle lgtm/approved.`,
    );
    return 'skipped';
  }

  // An OWNERS approver's review also grants/revokes approved.
  const isApprover = await isListedInOwners(
    contentsOctokit,
    owner,
    repo,
    baseBranch,
    reviewAuthor,
    'OWNERS',
  );

  if (reviewState === 'APPROVED') {
    await grantLgtm(octokit, owner, repo, prNumber);
    if (isApprover) {
      await grantApprove(octokit, owner, repo, prNumber);
    }
    console.log(
      `Applied lgtm${isApprover ? ' and approved' : ''} to PR #${prNumber} (Approve review by ${reviewAuthor}).`,
    );
    return 'applied';
  }

  // CHANGES_REQUESTED -- always revoke both, regardless of whether this
  // reviewer is themselves an OWNERS approver: `approved` was only ever
  // granted as part of the same lgtm-acts-as-approve pairing, so it must
  // not outlive the `lgtm` that justified it just because a lower-trust
  // reviewer is the one requesting changes now.
  await revokeLgtm(octokit, owner, repo, prNumber);
  await revokeApprove(octokit, owner, repo, prNumber);
  console.log(
    `Removed lgtm and approved from PR #${prNumber} (Request-changes review by ${reviewAuthor}).`,
  );
  return 'revoked';
};

const main = async (): Promise<void> => {
  const reviewState = requireEnv('REVIEW_STATE');
  const reviewAuthor = requireEnv('REVIEW_AUTHOR');
  const prAuthor = requireEnv('PR_AUTHOR');

  if (reviewState !== 'APPROVED' && reviewState !== 'CHANGES_REQUESTED') {
    console.log(
      `Review state '${reviewState}' isn't APPROVED or CHANGES_REQUESTED -- nothing to do.`,
    );
    return;
  }

  const config: GitHubConfig = {
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
    statusToken: process.env.STATUS_GITHUB_TOKEN,
    token: requireEnv('GITHUB_TOKEN'),
  };
  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const baseBranch = requireEnv('BASE_BRANCH');

  await syncLabelsFromReview({
    baseBranch,
    contentsOctokit: createStatusOctokit(config),
    octokit: createOctokit(config),
    owner: config.owner,
    prAuthor,
    prNumber,
    repo: config.repo,
    reviewAuthor,
    reviewState,
  });
};

// Only auto-run when executed as the workflow entrypoint (not when imported by tests).
if (require.main === module) {
  void main().catch((err) => {
    console.error(safeErrorMessage(err));
    process.exit(1);
  });
}
