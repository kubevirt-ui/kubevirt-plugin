/* eslint-disable */
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

type StatusCheckResult = {
  allPassed: boolean;
  pending: string[];
};

const checkRequiredStatuses = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  requiredContexts: ReadonlySet<string>,
): Promise<StatusCheckResult> => {
  const remaining = new Set(requiredContexts);

  const { data: combined } = await octokit.repos.getCombinedStatusForRef({
    owner,
    ref: sha,
    repo,
  });
  for (const status of combined.statuses) {
    if (remaining.has(status.context) && status.state === 'success') {
      remaining.delete(status.context);
    }
  }

  const checkRuns: Awaited<ReturnType<typeof octokit.checks.listForRef>>['data']['check_runs'] = [];
  for await (const page of octokit.paginate.iterator(octokit.checks.listForRef, {
    owner,
    ref: sha,
    repo,
  })) {
    checkRuns.push(...page.data);
  }
  for (const run of checkRuns) {
    if (
      remaining.has(run.name) &&
      run.status === 'completed' &&
      (run.conclusion === 'success' || run.conclusion === 'skipped' || run.conclusion === 'neutral')
    ) {
      remaining.delete(run.name);
    }
  }

  return { allPassed: remaining.size === 0, pending: [...remaining] };
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

const buildStepSummary = (
  result: EligibilityResult,
  statusResult?: StatusCheckResult,
  merged?: boolean,
): string => {
  if (!result.determined) {
    return (
      '## Merge Gate\n\n' +
      ':warning: Could not determine eligibility — failed to read PR labels. ' +
      'Failing closed until a later event retries.'
    );
  }
  if (!result.eligible) {
    const lines = result.reasons.map((r) => `- **${r.short}** — ${r.long}`);
    return '## Merge Gate\n\n' + ':x: **Not eligible for merge**\n\n' + lines.join('\n');
  }
  if (statusResult && !statusResult.allPassed) {
    return (
      '## Merge Gate\n\n' +
      ':hourglass: **Eligible but waiting for required checks:**\n\n' +
      statusResult.pending.map((c) => `- \`${c}\``).join('\n')
    );
  }
  if (merged) {
    return '## Merge Gate\n\n' + ':white_check_mark: **Merged** — all checks passed.';
  }
  return (
    '## Merge Gate\n\n' +
    ':white_check_mark: **Merge-pool eligible** — PR carries `lgtm` + `approved` with no blocking labels.'
  );
};

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const botToken = process.env.BOT_TOKEN;
  const headSha = requireEnv('PR_HEAD_SHA');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const octokit = new Octokit({ auth: token });

  const result = await evaluateEligibility(octokit, owner, repo, prNumber);

  if (!result.eligible) {
    addStepSummary(buildStepSummary(result));

    const description =
      result.reasons.map((r) => r.short).join(', ') || 'could not determine eligibility';
    await setCommitStatus(
      octokit,
      owner,
      repo,
      headSha,
      'failure',
      description,
      MERGE_GATE_CONTEXT,
    );
    warnStep(`Not eligible: ${description}`);
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
    addStepSummary(buildStepSummary(result));
    await setCommitStatus(
      octokit,
      owner,
      repo,
      headSha,
      'failure',
      requiredChecksResult.error.slice(0, 140),
      MERGE_GATE_CONTEXT,
    );
    warnStep(requiredChecksResult.error);
    return;
  }

  const statusResult = await checkRequiredStatuses(
    octokit,
    owner,
    repo,
    headSha,
    requiredChecksResult.checks,
  );

  if (!statusResult.allPassed) {
    addStepSummary(buildStepSummary(result, statusResult));
    const pending = statusResult.pending.join(', ');
    await setCommitStatus(
      octokit,
      owner,
      repo,
      headSha,
      'pending',
      `Waiting: ${pending}`.slice(0, 140),
      MERGE_GATE_CONTEXT,
    );
    console.log(`PR #${prNumber} eligible but required checks pending: ${pending}`);
    return;
  }

  if (!botToken) {
    addStepSummary(buildStepSummary(result, statusResult));
    await setCommitStatus(
      octokit,
      owner,
      repo,
      headSha,
      'failure',
      'BOT_TOKEN unavailable — cannot merge',
      MERGE_GATE_CONTEXT,
    );
    warnStep('BOT_TOKEN is missing — merge requires the bot App token.');
    return;
  }

  const recheck = await evaluateEligibility(octokit, owner, repo, prNumber);
  if (!recheck.eligible) {
    const desc = recheck.reasons.map((r) => r.short).join(', ') || 'labels changed before merge';
    addStepSummary(buildStepSummary(recheck));
    await setCommitStatus(octokit, owner, repo, headSha, 'failure', desc, MERGE_GATE_CONTEXT);
    warnStep(`Not eligible on re-check: ${desc}`);
    return;
  }

  const botOctokit = new Octokit({ auth: botToken });

  // Merge Gate is required by branch protection. Mark it successful only after
  // eligibility + other required checks pass, and before calling the merge API.
  // Otherwise GitHub rejects the merge when Merge Gate is still pending/failed.
  await setCommitStatus(
    octokit,
    owner,
    repo,
    headSha,
    'success',
    'Ready to merge',
    MERGE_GATE_CONTEXT,
  );

  const merged = await tryMerge(botOctokit, owner, repo, prNumber, headSha);
  addStepSummary(buildStepSummary(result, statusResult, merged));

  if (!merged) {
    await setCommitStatus(
      octokit,
      owner,
      repo,
      headSha,
      'failure',
      'Merge failed — see workflow log',
      MERGE_GATE_CONTEXT,
    );
  } else {
    await setCommitStatus(octokit, owner, repo, headSha, 'success', 'Merged', MERGE_GATE_CONTEXT);
  }
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
