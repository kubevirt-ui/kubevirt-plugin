import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { closeOrphanedCheckRuns } from './close-orphaned-checks';

type FakeRun = {
  conclusion: null | string;
  id: number;
  status: string;
};

const makeOctokit = (runs: FakeRun[]) => {
  const update = mock.fn(async ({ check_run_id }: { check_run_id: number }) => ({
    data: { id: check_run_id },
  }));
  const paginate = mock.fn(async () => runs);
  return {
    checks: { update },
    paginate,
  };
};

describe('closeOrphanedCheckRuns', () => {
  it('closes only non-completed orphans by default', async () => {
    const octokit = makeOctokit([
      { conclusion: null, id: 1, status: 'in_progress' },
      { conclusion: 'failure', id: 2, status: 'completed' },
      { conclusion: 'success', id: 3, status: 'completed' },
    ]);

    await closeOrphanedCheckRuns(
      octokit as never,
      'owner',
      'repo',
      'sha',
      'Run Gating Tests',
      3,
      'https://example.com/run',
    );

    assert.equal(octokit.checks.update.mock.callCount(), 1);
    assert.equal(octokit.checks.update.mock.calls[0].arguments[0].check_run_id, 1);
  });

  it('also supersedes completed orphans when requested', async () => {
    const octokit = makeOctokit([
      { conclusion: null, id: 1, status: 'in_progress' },
      { conclusion: 'failure', id: 2, status: 'completed' },
      { conclusion: 'cancelled', id: 4, status: 'completed' },
      { conclusion: 'success', id: 3, status: 'completed' },
    ]);

    await closeOrphanedCheckRuns(
      octokit as never,
      'owner',
      'repo',
      'sha',
      'Evaluate Merge Eligibility',
      3,
      'https://example.com/run',
      { supersedeCompleted: true },
    );

    const updatedIds = octokit.checks.update.mock.calls
      .map((call) => call.arguments[0].check_run_id)
      .sort();
    assert.deepEqual(updatedIds, [1, 2, 4]);
  });

  it('never updates the kept check-run', async () => {
    const octokit = makeOctokit([{ conclusion: 'success', id: 9, status: 'completed' }]);

    await closeOrphanedCheckRuns(
      octokit as never,
      'owner',
      'repo',
      'sha',
      'Run Gating Tests',
      9,
      'https://example.com/run',
      { supersedeCompleted: true },
    );

    assert.equal(octokit.checks.update.mock.callCount(), 0);
  });
});
