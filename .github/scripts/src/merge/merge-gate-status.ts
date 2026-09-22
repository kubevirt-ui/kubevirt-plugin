import type { Octokit } from '@octokit/rest';

import type { Reason } from './merge-eligibility';

export const GATING_CHECK_NAME = 'Run Gating Tests';

type CheckRun = Awaited<ReturnType<Octokit['checks']['listForRef']>>['data']['check_runs'][number];

const FAILED_COMMIT_STATES = new Set(['failure', 'error']);
const PASSED_CHECK_CONCLUSIONS = new Set(['success', 'skipped', 'neutral']);
const FAILED_CHECK_CONCLUSIONS = new Set([
  'failure',
  'cancelled',
  'timed_out',
  'action_required',
]);

export type StatusCheckResult = {
  allPassed: boolean;
  failed: string[];
  pending: string[];
};

export type MergeGateOutcome = {
  description: string;
  state: 'failure' | 'pending' | 'success';
};

const nonGatingFailedChecks = (statusResult: StatusCheckResult): string[] =>
  statusResult.failed.filter((context) => context !== GATING_CHECK_NAME);

/** Human-readable gap for eligible PRs still missing required checks (excludes gating failures). */
export const describeRequiredCheckGap = (statusResult: StatusCheckResult): string => {
  const failed = nonGatingFailedChecks(statusResult);
  const parts: string[] = [];

  if (failed.length > 0) {
    parts.push(`Failed: ${failed.join(', ')}`);
  }
  if (statusResult.pending.length > 0) {
    parts.push(`Waiting: ${statusResult.pending.join(', ')}`);
  }

  return parts.join('; ') || 'Waiting for required checks';
};

const getLatestCheckRun = (runs: CheckRun[], name: string): CheckRun | undefined => {
  const matching = runs.filter((run) => run.name === name);
  if (matching.length === 0) {
    return undefined;
  }

  return matching.sort(
    (left, right) =>
      new Date(right.started_at ?? 0).getTime() - new Date(left.started_at ?? 0).getTime(),
  )[0];
};

export const fetchCheckRunsForRef = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
): Promise<CheckRun[]> => {
  const checkRuns: CheckRun[] = [];
  for await (const page of octokit.paginate.iterator(octokit.checks.listForRef, {
    owner,
    ref: sha,
    repo,
  })) {
    checkRuns.push(...page.data);
  }
  return checkRuns;
};

export const isGatingCheckFailed = (checkRuns: CheckRun[]): boolean => {
  const latest = getLatestCheckRun(checkRuns, GATING_CHECK_NAME);
  if (!latest || latest.status !== 'completed') {
    return false;
  }

  return FAILED_CHECK_CONCLUSIONS.has(latest.conclusion ?? '');
};

const classifyRequiredContext = (
  context: string,
  combinedStatuses: Awaited<
    ReturnType<Octokit['repos']['getCombinedStatusForRef']>
  >['data']['statuses'],
  checkRuns: CheckRun[],
): 'failed' | 'passed' | 'pending' => {
  const status = combinedStatuses.find((entry) => entry.context === context);
  if (status?.state === 'success') {
    return 'passed';
  }
  if (status && FAILED_COMMIT_STATES.has(status.state)) {
    return 'failed';
  }

  const latestRun = getLatestCheckRun(checkRuns, context);
  if (latestRun) {
    if (latestRun.status !== 'completed') {
      return 'pending';
    }
    if (PASSED_CHECK_CONCLUSIONS.has(latestRun.conclusion ?? '')) {
      return 'passed';
    }
    if (FAILED_CHECK_CONCLUSIONS.has(latestRun.conclusion ?? '')) {
      return 'failed';
    }
  }

  if (status?.state === 'pending') {
    return 'pending';
  }

  return 'pending';
};

export const checkRequiredStatuses = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  requiredContexts: ReadonlySet<string>,
  checkRuns: CheckRun[] = [],
): Promise<StatusCheckResult> => {
  const { data: combined } = await octokit.repos.getCombinedStatusForRef({
    owner,
    ref: sha,
    repo,
  });
  const resolvedCheckRuns =
    checkRuns.length > 0 ? checkRuns : await fetchCheckRunsForRef(octokit, owner, repo, sha);

  const pending: string[] = [];
  const failed: string[] = [];

  for (const context of requiredContexts) {
    const outcome = classifyRequiredContext(context, combined.statuses, resolvedCheckRuns);
    if (outcome === 'passed') {
      continue;
    }
    if (outcome === 'failed') {
      failed.push(context);
      continue;
    }
    pending.push(context);
  }

  return { allPassed: pending.length === 0 && failed.length === 0, failed, pending };
};

export const resolveMergeGateOutcome = (params: {
  determined: boolean;
  eligible: boolean;
  gatingFailed: boolean;
  merged?: boolean;
  operationalError?: string;
  readyToMerge?: boolean;
  reasons: Reason[];
  statusResult?: StatusCheckResult;
}): MergeGateOutcome => {
  if (params.operationalError) {
    return { description: params.operationalError.slice(0, 140), state: 'failure' };
  }

  if (
    params.gatingFailed ||
    params.statusResult?.failed.includes(GATING_CHECK_NAME) === true
  ) {
    return { description: 'E2E tests failed', state: 'failure' };
  }

  if (!params.determined) {
    return { description: 'Could not determine eligibility', state: 'failure' };
  }

  if (params.merged) {
    return { description: 'Merged', state: 'success' };
  }

  if (params.readyToMerge) {
    return { description: 'Ready to merge', state: 'success' };
  }

  if (!params.eligible) {
    const description =
      params.reasons.map((reason) => reason.short).join(', ') || 'Waiting for merge requirements';
    return { description, state: 'pending' };
  }

  if (params.statusResult && !params.statusResult.allPassed) {
    return {
      description: describeRequiredCheckGap(params.statusResult).slice(0, 140),
      state: 'pending',
    };
  }

  return { description: 'Merge-pool eligible', state: 'success' };
};

export const buildStepSummary = (
  result: { determined: boolean; eligible: boolean; reasons: Reason[] },
  statusResult?: StatusCheckResult,
  gatingFailed?: boolean,
  merged?: boolean,
): string => {
  if (!result.determined) {
    return (
      '## Merge Gate\n\n' +
      ':warning: Could not determine eligibility — failed to read PR labels. ' +
      'Failing closed until a later event retries.'
    );
  }

  if (gatingFailed || statusResult?.failed.includes(GATING_CHECK_NAME)) {
    return '## Merge Gate\n\n' + ':x: **E2E tests failed** — comment `/retest-e2e` after fixing.';
  }

  if (!result.eligible) {
    const lines = result.reasons.map((reason) => `- **${reason.short}** — ${reason.long}`);
    return (
      '## Merge Gate\n\n' +
      ':hourglass: **Waiting for merge requirements**\n\n' +
      lines.join('\n')
    );
  }

  if (statusResult && !statusResult.allPassed) {
    const failed = nonGatingFailedChecks(statusResult);
    const lines = [
      ...failed.map((context) => `- \`${context}\` — failed`),
      ...statusResult.pending.map((context) => `- \`${context}\` — pending`),
    ];
    const heading =
      failed.length > 0 && statusResult.pending.length > 0
        ? 'Eligible but blocked on required checks:'
        : failed.length > 0
          ? 'Eligible but required checks failed:'
          : 'Eligible but waiting for required checks:';

    return (
      '## Merge Gate\n\n' + `:hourglass: **${heading}**\n\n` + lines.join('\n')
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
