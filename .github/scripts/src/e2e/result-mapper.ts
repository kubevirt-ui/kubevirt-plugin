/**
 * Maps E2E test verification outcomes to check-run title/summary/conclusion.
 * Replaces the bash case statement in hot-cluster-e2e.yml's result-details step.
 */

export type VerifyReason =
  | 'left-pool'
  | 'merge-conflict'
  | 'passed'
  | 'resolve-context-failed'
  | 'test-failed'
  | 'untrusted-retest';

export type ResultDetails = {
  conclusion: 'failure' | 'neutral' | 'success';
  summary: string;
  title: string;
};

type MapParams = {
  held: boolean;
  isPoolRetest: boolean;
  mainSha: string;
  prNumber: string;
  reason: VerifyReason;
  testFailureSummary: string;
  workflowRunUrl: string;
};

const mapMergeConflict = (map: MapParams, poolSuffix: string): ResultDetails => ({
  conclusion: 'failure',
  summary: map.isPoolRetest
    ? `PR #${map.prNumber} no longer merges cleanly with the current main tip (${map.mainSha}) -- resolve the conflict and push an update, which will trigger a normal gating run.`
    : `PR #${map.prNumber} does not merge cleanly with the current base branch tip -- resolve the conflict and push an update to trigger a fresh run.`,
  title: map.isPoolRetest
    ? `Hot Cluster E2E: PR no longer merges cleanly with main${poolSuffix}`
    : 'Hot Cluster E2E: PR does not merge cleanly with the base branch',
});

const mapLeftPool = (map: MapParams, poolSuffix: string): ResultDetails => ({
  conclusion: 'failure',
  summary: map.isPoolRetest
    ? `PR #${map.prNumber} no longer carries the lgtm+approved (no hold) labels required for the merge pool, re-checked fresh when this retest ran against main tip ${map.mainSha} -- the cluster run was skipped.`
    : `PR #${map.prNumber} does not carry the lgtm+approved (no hold) labels required for the merge pool, re-checked fresh at run time -- the cluster run was skipped.`,
  title: map.isPoolRetest
    ? `Hot Cluster E2E: no longer in the merge pool${poolSuffix}`
    : 'Hot Cluster E2E: not in the merge pool',
});

const mapUntrustedRetest = (map: MapParams, poolSuffix: string): ResultDetails => ({
  conclusion: 'failure',
  summary: map.isPoolRetest
    ? `PR #${map.prNumber} is not from OWNERS, not from a same-repo branch, and does not currently carry 'ok-to-test' (re-checked fresh when this retest ran against main tip ${map.mainSha}) -- the cluster run was skipped. A maintainer can add 'ok-to-test' to allow it.`
    : `Hot cluster E2E has not run for PR #${map.prNumber} because the author is not listed in OWNERS, is not from a same-repo branch, and does not currently carry 'ok-to-test' (re-checked fresh at run time). A maintainer can add the 'ok-to-test' label to trigger it.`,
  title: map.isPoolRetest
    ? `Hot Cluster E2E: not CI-trusted for a retest${poolSuffix}`
    : 'Hot Cluster E2E: gating tests did not run (not CI-trusted)',
});

const mapTestFailed = (map: MapParams, poolSuffix: string): ResultDetails => {
  const baseSummary = map.isPoolRetest
    ? `Re-validated PR #${map.prNumber} merged with the current main tip (${map.mainSha}) after main advanced -- tests did not pass.`
    : `Hot cluster gating tests did not pass for PR #${map.prNumber}.`;

  const summary = [
    baseSummary,
    map.testFailureSummary ? `\n\n---\n\n### Failed Tests\n\n${map.testFailureSummary}` : '',
    `\n\nSee the [workflow run](${map.workflowRunUrl}) for full details, or comment \`/retest-e2e\` once fixed.`,
  ].join('');

  return {
    conclusion: 'failure',
    summary,
    title: `Hot Cluster E2E: gating tests did not pass${poolSuffix}`,
  };
};

export const mapResultDetails = (params: MapParams): ResultDetails => {
  const poolSuffix = params.isPoolRetest ? ' (retest after main advanced)' : '';

  if (params.held) {
    return {
      conclusion: 'neutral',
      summary: `PR #${params.prNumber} is on hold via /hold-e2e (re-checked fresh as this run finished) -- its real result is suppressed so it can't re-green the required check out from under the hold. Comment /retest-e2e to lift the hold and get a fresh result.`,
      title: `Hot Cluster E2E: held via /hold-e2e${poolSuffix}`,
    };
  }

  switch (params.reason) {
    case 'passed':
      return {
        conclusion: 'success',
        summary: params.isPoolRetest
          ? `Re-validated PR #${params.prNumber} merged with the current main tip (${params.mainSha}) after main advanced.`
          : `Hot cluster gating tests passed for PR #${params.prNumber} at this commit.`,
        title: `Hot Cluster E2E: gating tests passed${poolSuffix}`,
      };
    case 'merge-conflict':
      return mapMergeConflict(params, poolSuffix);
    case 'left-pool':
      return mapLeftPool(params, poolSuffix);
    case 'untrusted-retest':
      return mapUntrustedRetest(params, poolSuffix);
    case 'resolve-context-failed':
      return {
        conclusion: 'failure',
        summary: `Could not resolve PR #${params.prNumber}'s context (head SHA / labels / mergeability). See the workflow run for details.`,
        title: `Hot Cluster E2E: could not resolve PR context${poolSuffix}`,
      };
    case 'test-failed':
      return mapTestFailed(params, poolSuffix);
    default: {
      const _exhaustive: never = params.reason;
      throw new Error(`Unhandled verify reason: ${String(_exhaustive)}`);
    }
  }
};
