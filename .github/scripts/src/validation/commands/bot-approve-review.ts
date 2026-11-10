/**
 * Submit a GitHub APPROVE review as kubevirt-plugin-bot so release-branch
 * protection (required approving reviews) is satisfied when an OWNERS
 * approver comments /lgtm or /approve -- without a separate Approve click.
 *
 * Soft-fails when the App is not allowed to approve (repo setting / perms);
 * labels are still applied by the caller.
 */

import type { Octokit } from '@octokit/rest';

import { dispatchWorkflow } from '../../shared/dispatch';
import { safeErrorMessage } from '../../utils';

import { hasApprovingReview } from '../../merge/approving-reviews';

export type BotApproveResult = 'already-approved' | 'approved' | 'failed';

export type EnsureBotApprovingReviewParams = {
  author: string;
  command: '/approve' | '/lgtm';
  headSha: string;
  owner: string;
  prNumber: number;
  repo: string;
};

export const ensureBotApprovingReview = async (
  octokit: Octokit,
  params: EnsureBotApprovingReviewParams,
): Promise<BotApproveResult> => {
  const { author, command, headSha, owner, prNumber, repo } = params;

  try {
    if (await hasApprovingReview(octokit, owner, repo, prNumber)) {
      console.log(
        `PR #${prNumber} already has an approving review -- skipping bot APPROVE for ${command}.`,
      );
      return 'already-approved';
    }

    await octokit.pulls.createReview({
      body: `Approved on behalf of @${author} via \`${command}\`.`,
      commit_id: headSha,
      event: 'APPROVE',
      owner,
      pull_number: prNumber,
      repo,
    });
    console.log(`Bot APPROVE review submitted on PR #${prNumber} for ${command} by ${author}.`);
    return 'approved';
  } catch (err) {
    const msg = safeErrorMessage(err);
    console.warn(`Could not submit bot APPROVE on PR #${prNumber}: ${msg}`);
    try {
      await octokit.issues.createComment({
        body:
          `⚠️ Could not submit a GitHub approving review on behalf of @${author} after \`${command}\`:\n\n` +
          `\`\`\`\n${msg}\n\`\`\`\n\n` +
          `Merge-pool labels were still applied. On branches that require an approving review, ` +
          `please use GitHub **Approve**, or enable “Allow GitHub Actions to create and approve pull requests” for the bot App.`,
        issue_number: prNumber,
        owner,
        repo,
      });
    } catch (commentErr) {
      console.warn(`Could not post bot-APPROVE failure comment: ${safeErrorMessage(commentErr)}`);
    }
    return 'failed';
  }
};

/** Re-run Auto Merge from main so Merge Gate retries after Approve / bot APPROVE. */
export const dispatchAutoMerge = async (
  octokit: Octokit,
  params: { headSha: string; owner: string; prNumber: number; repo: string },
): Promise<void> => {
  try {
    await dispatchWorkflow(octokit, {
      inputs: {
        pr_head_sha: params.headSha,
        pr_number: String(params.prNumber),
      },
      owner: params.owner,
      ref: 'main',
      repo: params.repo,
      workflowId: 'auto-merge.yml',
    });
    console.log(
      `Dispatched Auto Merge for PR #${params.prNumber} (sha ${params.headSha.slice(0, 7)}).`,
    );
  } catch (err) {
    console.warn(
      `Could not dispatch Auto Merge for PR #${params.prNumber}: ${safeErrorMessage(err)}`,
    );
  }
};
