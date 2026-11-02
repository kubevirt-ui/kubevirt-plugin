import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  checkRequiredStatuses,
  describeRequiredCheckGap,
  GATING_CHECK_NAME,
  isGatingCheckFailed,
  resolveMergeGateOutcome,
} from './merge-gate-status';

type CheckRun = Parameters<typeof isGatingCheckFailed>[0][number];

/** Minimal Octokit stub satisfying checkRequiredStatuses' two API calls. */
const makeOctokit = () =>
  ({
    repos: {
      getCombinedStatusForRef: async () => ({ data: { statuses: [] } }),
    },
  }) as unknown as Parameters<typeof checkRequiredStatuses>[0];

describe('isGatingCheckFailed', () => {
  it('returns true when the latest gating check failed', () => {
    assert.equal(
      isGatingCheckFailed([
        {
          conclusion: 'failure',
          name: GATING_CHECK_NAME,
          started_at: '2026-01-02T00:00:00Z',
          status: 'completed',
        } as Parameters<typeof isGatingCheckFailed>[0][number],
      ]),
      true,
    );
  });

  it('returns false when gating is still running', () => {
    assert.equal(
      isGatingCheckFailed([
        {
          conclusion: null,
          name: GATING_CHECK_NAME,
          started_at: '2026-01-02T00:00:00Z',
          status: 'in_progress',
        } as Parameters<typeof isGatingCheckFailed>[0][number],
      ]),
      false,
    );
  });
});

describe('checkRequiredStatuses', () => {
  it('treats a completed "neutral" conclusion as pending, not passed', async () => {
    // Reproduces the PR #5012 bug: on-main-push republishes a stale Run
    // Gating Tests check as completed/neutral. Auto-merge must keep waiting
    // for a real success instead of treating the stale marker as a pass.
    const checkRuns: CheckRun[] = [
      {
        conclusion: 'neutral',
        name: GATING_CHECK_NAME,
        started_at: '2026-01-02T00:00:00Z',
        status: 'completed',
      } as CheckRun,
    ];

    const result = await checkRequiredStatuses(
      makeOctokit(),
      'owner',
      'repo',
      'sha',
      new Set([GATING_CHECK_NAME]),
      checkRuns,
    );

    assert.equal(result.allPassed, false);
    assert.deepEqual(result.failed, []);
    assert.deepEqual(result.pending, [GATING_CHECK_NAME]);
  });

  it('treats a completed "success" conclusion as passed', async () => {
    const checkRuns: CheckRun[] = [
      {
        conclusion: 'success',
        name: GATING_CHECK_NAME,
        started_at: '2026-01-02T00:00:00Z',
        status: 'completed',
      } as CheckRun,
    ];

    const result = await checkRequiredStatuses(
      makeOctokit(),
      'owner',
      'repo',
      'sha',
      new Set([GATING_CHECK_NAME]),
      checkRuns,
    );

    assert.equal(result.allPassed, true);
  });
});

describe('resolveMergeGateOutcome', () => {
  it('uses pending while waiting for review labels', () => {
    const outcome = resolveMergeGateOutcome({
      determined: true,
      eligible: false,
      gatingFailed: false,
      reasons: [{ long: 'needs lgtm', short: 'Missing lgtm' }],
    });

    assert.equal(outcome.state, 'pending');
    assert.equal(outcome.description, 'Missing lgtm');
  });

  it('uses failure when gating tests failed', () => {
    const outcome = resolveMergeGateOutcome({
      determined: true,
      eligible: false,
      gatingFailed: true,
      reasons: [{ long: 'needs lgtm', short: 'Missing lgtm' }],
    });

    assert.equal(outcome.state, 'failure');
    assert.equal(outcome.description, 'E2E tests failed');
  });

  it('uses pending while required checks are still running', () => {
    const outcome = resolveMergeGateOutcome({
      determined: true,
      eligible: true,
      gatingFailed: false,
      reasons: [],
      statusResult: {
        allPassed: false,
        failed: [],
        pending: [GATING_CHECK_NAME, 'build'],
      },
    });

    assert.equal(outcome.state, 'pending');
    assert.match(outcome.description, /Waiting: Run Gating Tests, build/);
  });

  it('labels non-gating failures separately from pending checks', () => {
    const outcome = resolveMergeGateOutcome({
      determined: true,
      eligible: true,
      gatingFailed: false,
      reasons: [],
      statusResult: {
        allPassed: false,
        failed: ['build'],
        pending: [GATING_CHECK_NAME],
      },
    });

    assert.equal(outcome.state, 'pending');
    assert.equal(outcome.description, 'Failed: build; Waiting: Run Gating Tests');
  });
});

describe('describeRequiredCheckGap', () => {
  it('separates failed and pending required checks', () => {
    assert.equal(
      describeRequiredCheckGap({
        allPassed: false,
        failed: ['build', 'test'],
        pending: [GATING_CHECK_NAME],
      }),
      'Failed: build, test; Waiting: Run Gating Tests',
    );
  });
});
