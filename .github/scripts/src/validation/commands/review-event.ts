/* eslint-disable no-console */
// Entrypoint for pr_review_commands.yml -- an Approve/Request-changes
// review toggles lgtm/approved the same way the /lgtm command does. No PR
// comment/reaction is posted (reviews don't support reactions) -- a
// routine skip just logs and exits normally rather than failing the job.
import type { Octokit } from '@octokit/rest';

import { isWriteCollaborator } from './collaborator-trust';
import { createOctokit, createStatusOctokit } from '../../github-repo';
import { isListedInOwners } from '../pr-path-validation/owners';
import { grantApprove, grantLgtm, revokeApprove, revokeLgtm } from './review-labels';
import { requireEnv, safeErrorMessage, sameGitHubLogin } from '../../utils';
import type { GitHubConfig } from '../../types/index';

export type ReviewSyncResult = 'applied' | 'revoked' | 'skipped';

export type SyncLabelsFromReviewArgs = {
  octokit: Octokit;
  contentsOctokit: Octokit;
  owner: string;
  repo: string;
  prNumber: number;
  baseBranch: string;
  reviewState: 'APPROVED' | 'CHANGES_REQUESTED';
  reviewAuthor: string;
  prAuthor: string;
};

/** Core logic for pr_review_commands.yml -- exported for unit tests. */
export const syncLabelsFromReview = async (
  args: SyncLabelsFromReviewArgs,
): Promise<ReviewSyncResult> => {
  const {
    octokit,
    contentsOctokit,
    owner,
    repo,
    prNumber,
    baseBranch,
    reviewState,
    reviewAuthor,
    prAuthor,
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
    if (isApprover) await grantApprove(octokit, owner, repo, prNumber);
    console.log(
      `Applied lgtm${isApprover ? ' and approved' : ''} to PR #${prNumber} (Approve review by ${reviewAuthor}).`,
    );
    return 'applied';
  }

  // CHANGES_REQUESTED
  await revokeLgtm(octokit, owner, repo, prNumber);
  if (isApprover) await revokeApprove(octokit, owner, repo, prNumber);
  console.log(
    `Removed lgtm${isApprover ? ' and approved' : ''} from PR #${prNumber} (Request-changes review by ${reviewAuthor}).`,
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
    token: requireEnv('GITHUB_TOKEN'),
    statusToken: process.env.STATUS_GITHUB_TOKEN,
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
  };
  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const baseBranch = requireEnv('BASE_BRANCH');

  await syncLabelsFromReview({
    octokit: createOctokit(config),
    contentsOctokit: createStatusOctokit(config),
    owner: config.owner,
    repo: config.repo,
    prNumber,
    baseBranch,
    reviewState,
    reviewAuthor,
    prAuthor,
  });
};

// Only auto-run when executed as the workflow entrypoint (not when imported by tests).
if (require.main === module) {
  main().catch((err) => {
    console.error(safeErrorMessage(err));
    process.exit(1);
  });
}
