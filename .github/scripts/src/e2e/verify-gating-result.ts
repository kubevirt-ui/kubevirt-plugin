/**
 * Verify that hot-cluster E2E ran and passed. Determines the failure
 * reason and sets the `reason` output for downstream steps.
 *
 * Required env: E2E_RESULT, IS_RETEST
 * Optional env: RESOLVE_PR_CONTEXT_RESULT, PR_NUMBER, MERGEABLE,
 *               STILL_IN_POOL, RETEST_TRUSTED
 * Outputs (GITHUB_OUTPUT): reason
 */

import { requireEnv } from '../utils';
import { setOutput } from '../shared/output';

const main = async (): Promise<void> => {
  const e2eResult = requireEnv('E2E_RESULT');
  const isRetest = process.env.IS_RETEST === 'true';
  const prNumber = process.env.PR_NUMBER ?? '';
  const resolveResult = process.env.RESOLVE_PR_CONTEXT_RESULT ?? '';
  const mergeable = process.env.MERGEABLE ?? '';
  const stillInPool = process.env.STILL_IN_POOL ?? '';
  const retestTrusted = process.env.RETEST_TRUSTED ?? '';

  if (isRetest && (resolveResult === 'failure' || resolveResult === 'cancelled')) {
    console.error(
      `::error::Could not resolve PR #${prNumber}'s context (head SHA / labels / mergeability) -- prepare's Resolve PR Context step ended in '${resolveResult}'. See the 'Prepare' job for details.`,
    );
    setOutput('reason', 'resolve-context-failed');
    process.exit(1);
  }

  console.log(`run-e2e-tests result: ${e2eResult}`);

  if (e2eResult === 'success') {
    console.log('Hot cluster gating tests passed.');
    setOutput('reason', 'passed');
    return;
  }

  if (isRetest && mergeable === 'false') {
    console.error(
      `::error::PR #${prNumber} no longer merges cleanly with the current base branch tip -- resolve the conflict and push an update (this will trigger a normal gating run).`,
    );
    setOutput('reason', 'merge-conflict');
  } else if (isRetest && stillInPool === 'false') {
    console.error(
      `::error::PR #${prNumber} no longer carries the lgtm+approved (no hold) labels required for the merge pool, re-checked fresh at run time -- skipping the retest.`,
    );
    setOutput('reason', 'left-pool');
  } else if (isRetest && retestTrusted === 'false') {
    console.error(
      `::error::PR #${prNumber} is not from OWNERS, not from a same-repo branch, and does not currently carry the 'ok-to-test' label -- skipping the retest (re-checked fresh at run time).`,
    );
    setOutput('reason', 'untrusted-retest');
  } else {
    console.error(
      `::error::Hot cluster gating tests did not pass (run-e2e-tests result: '${e2eResult}'). See the 'Run E2E Tests' job for details, or use /retest-e2e once fixed.`,
    );
    setOutput('reason', 'test-failed');
  }

  process.exit(1);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
