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
import type { Reason } from './merge-eligibility';
import { describeEligibility } from './merge-eligibility';
import {
  buildStepSummary,
  checkRequiredStatuses,
  fetchCheckRunsForRef,
  isGatingCheckFailed,
  resolveMergeGateOutcome,
} from './merge-gate-status';

const MERGE_GATE_CONTEXT = 'Merge Gate';

type RequiredChecksResult = { ok: true; checks: Set<string> } | { ok: false; error: string };

const getRequiredChecks = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
): Promise<RequiredChecksResult> => {
  try {
    const { data } = await octokit.repos.getBranchProtection({ branch, owner, repo });
    const contexts = data.required_status_checks?.contexts ?? [];
    const checks = data.required_status_checks?.checks?.map((c) => c.context) ?? [];
    const all = new Set([...contexts, ...checks]);
    all.delete(MERGE_GATE_CONTEXT);
    console.log(`Required checks from branch protection (${branch}): [${[...all].join(', ')}]`);
    return { checks: all, ok: true };
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      console.log(`No branch protection configured on ${branch} — skipping status verification.`);
      return { checks: new Set<string>(), ok: true };
    }
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Could not read branch protection for ${branch}: ${msg}`, ok: false };
  }
};

type EligibilityResult = {
  baseBranch: string;
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
      determined: true,
      eligible: isEligible,
      reasons: prReasons,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `Could not determine merge-pool eligibility for PR #${prNumber}: ${msg} -- failing closed.`,
    );
    return { baseBranch: '', determined: false, eligible: false, reasons: [] };
  }
};

const tryMerge = async (
  botOctokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  sha: string,
): Promise<boolean> => {
  try {
    await botOctokit.pulls.merge({
      merge_method: 'squash',
      owner,
      pull_number: prNumber,
      repo,
      sha,
    });
    console.log(`Squash-merged PR #${prNumber} via API.`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not merge PR #${prNumber}: ${msg}`);
    return false;
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
  });

  addStepSummary(
    buildStepSummary(result, params.statusResult, params.gatingFailed, params.merged),
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

  const checkRuns = await fetchCheckRunsForRef(octokit, owner, repo, headSha);
  const gatingFailed = isGatingCheckFailed(checkRuns);
  const result = await evaluateEligibility(octokit, owner, repo, prNumber);

  if (gatingFailed || !result.eligible) {
    await publishMergeGateStatus(octokit, owner, repo, headSha, result, { gatingFailed });
    return;
  }

  const protectionClient = botToken ? new Octokit({ auth: botToken }) : octokit;
  const requiredChecksResult = await getRequiredChecks(
    protectionClient,
    owner,
    repo,
    result.baseBranch,
  );

  if (!requiredChecksResult.ok) {
    await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
      gatingFailed,
      operationalError: requiredChecksResult.error,
    });
    return;
  }

  const statusResult = await checkRequiredStatuses(
    octokit,
    owner,
    repo,
    headSha,
    requiredChecksResult.checks,
    checkRuns,
  );

  if (!statusResult.allPassed) {
    await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
      gatingFailed,
      statusResult,
    });
    return;
  }

  if (!botToken) {
    await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
      gatingFailed,
      operationalError: 'BOT_TOKEN unavailable — cannot merge',
    });
    return;
  }

  const recheck = await evaluateEligibility(octokit, owner, repo, prNumber);
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

  if (!merged) {
    await publishMergeGateStatus(octokit, owner, repo, headSha, result, {
      gatingFailed,
      operationalError: 'Merge failed — see workflow log',
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
