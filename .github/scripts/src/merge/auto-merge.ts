/**
 * Auto-merge: determine merge-pool eligibility and merge directly via API.
 * Entry point: npx tsx src/merge/auto-merge.ts
 *
 * Required env: GITHUB_TOKEN, BOT_TOKEN, GITHUB_REPOSITORY,
 *               PR_NUMBER, PR_HEAD_SHA
 *
 * Bypasses GitHub's native auto-merge (enablePullRequestAutoMerge) because
 * the platform's mergeStateStatus evaluation is unreliable — it can report
 * BLOCKED even when all required checks pass (known GitHub bug). Instead,
 * this script checks label eligibility + required statuses itself, then
 * squash-merges via PUT /pulls/:number/merge using the bot token so that
 * post-merge workflows (deploy, etc.) are triggered.
 *
 * Publishes a "Merge Gate" commit status (also a required branch-protection
 * check). Success is set before the merge API call so GitHub does not reject
 * the merge for a pending/failed Merge Gate. The job itself always exits 0.
 */

import { Octokit } from '@octokit/rest';

import { setCommitStatus } from '../github-comments';
import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { getMergePoolBlockers } from '../shared/merge-pool';
import { addStepSummary, warnStep } from '../shared/output';
import {
  getBranchProtectionRequirements,
  hasApprovingReview,
  isApprovingReviewMergeError,
} from './approving-reviews';
import type { Reason } from './merge-eligibility';
import { describeEligibility } from './merge-eligibility';
import {
  buildStepSummary,
  checkRequiredStatuses,
  fetchCheckRunsForRef,
  isGatingCheckFailed,
  MERGE_GATE_CONTEXT,
  resolveMergeGateOutcome,
} from './merge-gate-status';

type EligibilityResult = {
  baseBranch: string;
  currentHeadSha: string;
  determined: boolean;
  eligible: boolean;
  reasons: Reason[];
};

const evaluateEligibility = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<EligibilityResult> => {
  try {
    const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });
    const blockers = getMergePoolBlockers(pullRequest.labels);
    const isEligible =
      !blockers.missingLgtm && !blockers.missingApproved && blockers.blockingLabels.length === 0;
    const prReasons = describeEligibility(
      blockers.missingLgtm,
      blockers.missingApproved,
      blockers.blockingLabels,
    );
    console.log(
      `PR #${prNumber} labels: [${pullRequest.labels.map((label) => label.name).join(', ')}] -- merge-pool eligible: ${isEligible}`,
    );
    return {
      baseBranch: pullRequest.base.ref,
      currentHeadSha: pullRequest.head.sha,
      determined: true,
      eligible: isEligible,
      reasons: prReasons,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `Could not determine merge-pool eligibility for PR #${prNumber}: ${msg} -- failing closed.`,
    );
    return {
      baseBranch: '',
      currentHeadSha: '',
      determined: false,
      eligible: false,
      reasons: [],
    };
  }
};

/** Stale workflow_dispatch / race: do not publish Merge Gate on a SHA that is no longer HEAD. */
const isStaleHeadSha = (expectedHeadSha: string, result: EligibilityResult): boolean =>
  result.determined && result.currentHeadSha !== expectedHeadSha;

type MergeAttempt = { error: string; ok: false } | { ok: true };

const tryMerge = async (
  botOctokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  sha: string,
): Promise<MergeAttempt> => {
  try {
    await botOctokit.pulls.merge({
      merge_method: 'squash',
      owner,
      pull_number: prNumber,
      repo,
      sha,
    });
    console.log(`Squash-merged PR #${prNumber} via API.`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not merge PR #${prNumber}: ${msg}`);
    return { error: msg, ok: false };
  }
};

const publishMergeGateStatus = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
  result: EligibilityResult,
  params: {
    gatingFailed: boolean;
    merged?: boolean;
    operationalError?: string;
    readyToMerge?: boolean;
    statusResult?: Awaited<ReturnType<typeof checkRequiredStatuses>>;
    waitingForReview?: boolean;
  },
): Promise<void> => {
  const outcome = resolveMergeGateOutcome({
    determined: result.determined,
    eligible: result.eligible,
    gatingFailed: params.gatingFailed,
    merged: params.merged,
    operationalError: params.operationalError,
    readyToMerge: params.readyToMerge,
    reasons: result.reasons,
    statusResult: params.statusResult,
    waitingForReview: params.waitingForReview,
  });

  addStepSummary(
    buildStepSummary(
      result,
      params.statusResult,
      params.gatingFailed,
      params.merged,
      params.waitingForReview,
    ),
  );
  await setCommitStatus(
    octokit,
    owner,
    repo,
    headSha,
    outcome.state,
    outcome.description,
    MERGE_GATE_CONTEXT,
  );

  if (outcome.state === 'failure') {
    warnStep(outcome.description);
  } else if (outcome.state === 'pending') {
    console.log(`Merge Gate pending: ${outcome.description}`);
  }
};

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const botToken = process.env.BOT_TOKEN;
  const headSha = requireEnv('PR_HEAD_SHA');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const octokit = new Octokit({ auth: token });

  const result = await evaluateEligibility(octokit, owner, repo, prNumber);
  if (isStaleHeadSha(headSha, result)) {
    console.warn(
      `PR #${prNumber} head moved (${headSha.slice(0, 7)} → ${result.currentHeadSha.slice(0, 7)}); ` +
        `skipping Merge Gate update for stale SHA.`,
    );
    return;
  }

  const checkRuns = await fetchCheckRunsForRef(octokit, owner, repo, headSha);
  const gatingFailed = isGatingCheckFailed(checkRuns);

  if (gatingFailed || !result.eligible) {
    await publishMergeGateStatus(octokit, owner, repo, headSha, result, { gatingFailed });
    return;
  }

  const protectionClient = botToken ? new Octokit({ auth: botToken }) : octokit;
  const protection = await getBranchProtectionRequirements(
    protectionClient,
    owner,
    repo,
    result.baseBranch,
  );

  if (!protection.ok) {
    await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
      gatingFailed,
      operationalError: protection.error,
    });
    return;
  }

  const statusResult = await checkRequiredStatuses(
    octokit,
    owner,
    repo,
    headSha,
    protection.requiredChecks,
    checkRuns,
  );

  if (!statusResult.allPassed) {
    await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
      gatingFailed,
      statusResult,
    });
    return;
  }

  if (protection.requiredApprovingReviewCount > 0) {
    const approved = await hasApprovingReview(octokit, owner, repo, prNumber);
    if (!approved) {
      console.log(
        `PR #${prNumber} needs ${protection.requiredApprovingReviewCount} approving review(s) — waiting.`,
      );
      await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
        gatingFailed,
        statusResult,
        waitingForReview: true,
      });
      return;
    }
  }

  if (!botToken) {
    await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
      gatingFailed,
      operationalError: 'BOT_TOKEN unavailable — cannot merge',
    });
    return;
  }

  const recheck = await evaluateEligibility(octokit, owner, repo, prNumber);
  if (isStaleHeadSha(headSha, recheck)) {
    console.warn(
      `PR #${prNumber} head moved during evaluation (${headSha.slice(0, 7)} → ${recheck.currentHeadSha.slice(0, 7)}); ` +
        `skipping Merge Gate update for stale SHA.`,
    );
    return;
  }
  if (!recheck.eligible) {
    await publishMergeGateStatus(octokit, owner, repo, headSha, recheck, { gatingFailed });
    return;
  }

  const botOctokit = new Octokit({ auth: botToken });

  // Merge Gate is required by branch protection. Mark it successful only after
  // eligibility + other required checks pass, and before calling the merge API.
  // Otherwise GitHub rejects the merge when Merge Gate is still pending/failed.
  await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
    gatingFailed,
    readyToMerge: true,
    statusResult,
  });

  const merged = await tryMerge(botOctokit, owner, repo, prNumber, headSha);

  if (!merged.ok) {
    if (isApprovingReviewMergeError(merged.error)) {
      await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
        gatingFailed,
        statusResult,
        waitingForReview: true,
      });
      return;
    }

    await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
      gatingFailed,
      operationalError: `Merge failed — ${merged.error}`.slice(0, 140),
      statusResult,
    });
    return;
  }

  await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
    gatingFailed,
    merged: true,
    statusResult,
  });
};

void main().catch(async (err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`::error::${msg}`);

  const headSha = process.env.PR_HEAD_SHA;
  const fullRepo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (headSha && fullRepo && token) {
    const [owner, repo] = fullRepo.split('/');
    try {
      await setCommitStatus(
        new Octokit({ auth: token }),
        owner,
        repo,
        headSha,
        'failure',
        `Script error: ${msg}`.slice(0, 140),
        MERGE_GATE_CONTEXT,
      );
    } catch {
      console.error('Could not publish failure commit status.');
    }
  }
});
