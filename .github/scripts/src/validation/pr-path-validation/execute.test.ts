import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { executePathValidation, reportPathValidationError } from './execute';
import { HandledValidationError } from './errors';
import type { PathValidationConfig } from './types';

const TEST_CONFIG: PathValidationConfig = {
  exactPaths: [],
  pathPrefixes: ['protected/'],
  labels: { alert: 'alert', block: 'block', reviewed: 'reviewed', skip: 'skip' },
  labelMeta: {
    alert: { color: 'f59e0b', description: 'alert' },
    block: { color: 'b60205', description: 'block' },
  },
  statusContext: 'test-validation',
  displayName: 'Test validation',
  commandName: '/test-approved',
};

const buildStatusDescription = (): string => 'unused';

type Call = { method: string; args: unknown };

let nextCheckRunId = 2000;

type FakeOptions = {
  /** Reject createCommitStatus starting from this call number onward (1-indexed). Ignored when unset. */
  rejectCommitStatusFromCall?: number;
};

/** issues.listLabelsOnIssue throws -- simulating a genuinely unexpected failure after runPathValidation has already published its pending check-run. */
const fakeOctokitThrowingAfterPending = (
  calls: Call[],
  createdIds: number[],
  options: FakeOptions = {},
): Octokit =>
  ({
    checks: {
      create: async (args: unknown) => {
        const id = nextCheckRunId++;
        createdIds.push(id);
        calls.push({ method: 'checks.create', args });
        return { data: { id } };
      },
      update: async (args: unknown) => {
        calls.push({ method: 'checks.update', args });
        return { data: { id: (args as { check_run_id: number }).check_run_id } };
      },
    },
    issues: {
      listLabelsOnIssue: async () => {
        calls.push({ method: 'issues.listLabelsOnIssue', args: {} });
        throw new Error('API rate limit exceeded');
      },
    },
    repos: {
      createCommitStatus: async (args: unknown) => {
        const callNumber = calls.filter((c) => c.method === 'createCommitStatus').length + 1;
        calls.push({ method: 'createCommitStatus', args });
        if (
          options.rejectCommitStatusFromCall !== undefined &&
          callNumber >= options.rejectCommitStatusFromCall
        ) {
          throw new Error('secondary outage: statuses unavailable');
        }
      },
    },
  }) as unknown as Octokit;

describe('executePathValidation', () => {
  it('finalizes the same check-run (update, not a second create) when an unexpected error occurs after the pending check-run is published', async () => {
    const calls: Call[] = [];
    const createdIds: number[] = [];
    const octokit = fakeOctokitThrowingAfterPending(calls, createdIds);

    await assert.rejects(
      executePathValidation(
        {
          baseBranch: 'main',
          config: { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
          files: [{ filename: 'protected/foo.ts' }],
          headSha: 'abc123',
          octokit,
          prNumber: 1,
          statusOctokit: octokit,
        },
        TEST_CONFIG,
        buildStatusDescription,
      ),
      HandledValidationError,
    );

    const created = calls.filter((c) => c.method === 'checks.create');
    const updated = calls.filter((c) => c.method === 'checks.update');
    assert.equal(created.length, 1, 'exactly one check-run should be created (the pending one)');
    assert.equal(
      updated.length,
      1,
      'the error path must update that same check-run, not create a second one',
    );
    assert.equal((updated[0].args as { check_run_id: number }).check_run_id, createdIds[0]);
    assert.equal((updated[0].args as { conclusion: string }).conclusion, 'failure');

    const statuses = calls
      .filter((c) => c.method === 'createCommitStatus')
      .map((c) => c.args as { state: string });
    assert.equal(statuses.at(-1)?.state, 'error');
  });

  it('still finalizes the check-run and rethrows HandledValidationError even when the status publish itself rejects', async () => {
    const calls: Call[] = [];
    const createdIds: number[] = [];
    // The first (pending) status call must succeed so a check-run actually
    // exists before the error path's own status publish is the one that
    // rejects -- this is what distinguishes "update the existing check-run"
    // from "nothing existed yet, so create one" (already covered above).
    const octokit = fakeOctokitThrowingAfterPending(calls, createdIds, {
      rejectCommitStatusFromCall: 2,
    });

    await assert.rejects(
      executePathValidation(
        {
          baseBranch: 'main',
          config: { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
          files: [{ filename: 'protected/foo.ts' }],
          headSha: 'abc123',
          octokit,
          prNumber: 1,
          statusOctokit: octokit,
        },
        TEST_CONFIG,
        buildStatusDescription,
      ),
      HandledValidationError,
    );

    const updated = calls.filter((c) => c.method === 'checks.update');
    assert.equal(
      updated.length,
      1,
      'the check-run must still be finalized even though the status publish rejected',
    );
    assert.equal((updated[0].args as { conclusion: string }).conclusion, 'failure');
  });
});

describe('reportPathValidationError', () => {
  it('still publishes the check-run when the status publish rejects', async () => {
    const calls: Call[] = [];
    const createdIds: number[] = [];
    const octokit = fakeOctokitThrowingAfterPending(calls, createdIds, {
      rejectCommitStatusFromCall: 1,
    });

    await assert.doesNotReject(
      reportPathValidationError(
        { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
        'abc123',
        TEST_CONFIG,
        new Error('boom'),
        octokit,
      ),
    );

    assert.equal(
      calls.some((c) => c.method === 'checks.create'),
      true,
      'a check-run must still be published even though the status publish rejected',
    );
    assert.equal(
      calls.some((c) => c.method === 'createCommitStatus'),
      true,
      'the status publish must still be attempted (even though it rejects)',
    );
  });
});
