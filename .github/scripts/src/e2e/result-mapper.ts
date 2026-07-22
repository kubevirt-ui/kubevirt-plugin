/**
 * Maps E2E test verification outcomes to check-run title/summary/conclusion.
 * Replaces the bash case statement in hot-cluster-e2e.yml's result-details step.
 */

export type VerifyReason =
  | 'passed'
  | 'test-failed'
  | 'merge-conflict'
  | 'left-pool'
  | 'untrusted-retest'
  | 'resolve-context-failed';

export type ResultDetails = {
  conclusion: 'success' | 'failure' | 'neutral';
  title: string;
  summary: string;
};

type MapParams = {
  reason: VerifyReason;
  prNumber: string;
  mainSha: string;
  isPoolRetest: boolean;
  held: boolean;
  testFailureSummary: string;
  workflowRunUrl: string;
};

export const mapResultDetails = (params: MapParams): ResultDetails => {
  const { reason, prNumber, mainSha, isPoolRetest, held, testFailureSummary, workflowRunUrl } =
    params;
  const poolSuffix = isPoolRetest ? ' (retest after main advanced)' : '';

  if (held) {
    return {
      conclusion: 'neutral',
      title: `Hot Cluster E2E: held via /hold-e2e${poolSuffix}`,
      summary: `PR #${prNumber} is on hold via /hold-e2e (re-checked fresh as this run finished) -- its real result is suppressed so it can't re-green the required check out from under the hold. Comment /retest-e2e to lift the hold and get a fresh result.`,
    };
  }

  switch (reason) {
    case 'passed':
      return {
        conclusion: 'success',
        title: `Hot Cluster E2E: gating tests passed${poolSuffix}`,
        summary: isPoolRetest
          ? `Re-validated PR #${prNumber} merged with the current main tip (${mainSha}) after main advanced.`
          : `Hot cluster gating tests passed for PR #${prNumber} at this commit.`,
      };

    case 'merge-conflict':
      return {
        conclusion: 'failure',
        title: isPoolRetest
          ? `Hot Cluster E2E: PR no longer merges cleanly with main${poolSuffix}`
          : 'Hot Cluster E2E: PR does not merge cleanly with the base branch',
        summary: isPoolRetest
          ? `PR #${prNumber} no longer merges cleanly with the current main tip (${mainSha}) -- resolve the conflict and push an update, which will trigger a normal gating run.`
          : `PR #${prNumber} does not merge cleanly with the current base branch tip -- resolve the conflict and push an update to trigger a fresh run.`,
      };

    case 'left-pool':
      return {
        conclusion: 'failure',
        title: isPoolRetest
          ? `Hot Cluster E2E: no longer in the merge pool${poolSuffix}`
          : 'Hot Cluster E2E: not in the merge pool',
        summary: isPoolRetest
          ? `PR #${prNumber} no longer carries the lgtm+approved (no hold) labels required for the merge pool, re-checked fresh when this retest ran against main tip ${mainSha} -- the cluster run was skipped.`
          : `PR #${prNumber} does not carry the lgtm+approved (no hold) labels required for the merge pool, re-checked fresh at run time -- the cluster run was skipped.`,
      };

    case 'untrusted-retest':
      return {
        conclusion: 'failure',
        title: isPoolRetest
          ? `Hot Cluster E2E: not CI-trusted for a retest${poolSuffix}`
          : 'Hot Cluster E2E: gating tests did not run (not CI-trusted)',
        summary: isPoolRetest
          ? `PR #${prNumber} is not from OWNERS, not from a same-repo branch, and does not currently carry 'ok-to-test' (re-checked fresh when this retest ran against main tip ${mainSha}) -- the cluster run was skipped. A maintainer can add 'ok-to-test' to allow it.`
          : `Hot cluster E2E has not run for PR #${prNumber} because the author is not listed in OWNERS, is not from a same-repo branch, and does not currently carry 'ok-to-test' (re-checked fresh at run time). A maintainer can add the 'ok-to-test' label to trigger it.`,
      };

    case 'resolve-context-failed':
      return {
        conclusion: 'failure',
        title: `Hot Cluster E2E: could not resolve PR context${poolSuffix}`,
        summary: `Could not resolve PR #${prNumber}'s context (head SHA / labels / mergeability). See the workflow run for details.`,
      };

    case 'test-failed': {
      let summary = isPoolRetest
        ? `Re-validated PR #${prNumber} merged with the current main tip (${mainSha}) after main advanced -- tests did not pass.`
        : `Hot cluster gating tests did not pass for PR #${prNumber}.`;

      if (testFailureSummary) {
        summary += `\n\n---\n\n### Failed Tests\n\n${testFailureSummary}`;
      }

      summary += `\n\nSee the [workflow run](${workflowRunUrl}) for full details, or comment \`/retest-e2e\` once fixed.`;

      return {
        conclusion: 'failure',
        title: `Hot Cluster E2E: gating tests did not pass${poolSuffix}`,
        summary,
      };
    }

    default: {
      const _exhaustive: never = reason;
      throw new Error(`Unhandled verify reason: ${_exhaustive}`);
    }
  }
};
