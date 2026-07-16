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

type FakeOptions = {
  /** Reject createCommitStatus starting from this call number onward (1-indexed). Ignored when unset. */
  rejectCommitStatusFromCall?: number;
};

/** issues.listLabelsOnIssue throws -- simulating a genuinely unexpected failure after runPathValidation has already published its pending status. */
const fakeOctokitThrowingAfterPending = (calls: Call[], options: FakeOptions = {}): Octokit =>
  ({
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
  it('reports a final "error" status when an unexpected error occurs after the pending status is published', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokitThrowingAfterPending(calls);

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

    const statuses = calls
      .filter((c) => c.method === 'createCommitStatus')
      .map((c) => c.args as { state: string });
    assert.equal(statuses.at(-1)?.state, 'error');
  });

  it('still rethrows HandledValidationError even when the error status publish itself rejects', async () => {
    const calls: Call[] = [];
    // The first (pending) status call must succeed -- this covers the
    // error path's own status publish being the one that rejects.
    const octokit = fakeOctokitThrowingAfterPending(calls, { rejectCommitStatusFromCall: 2 });

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
  });
});

describe('reportPathValidationError', () => {
  it('does not throw even when the status publish rejects', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokitThrowingAfterPending(calls, { rejectCommitStatusFromCall: 1 });

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
      calls.some((c) => c.method === 'createCommitStatus'),
      true,
      'the status publish must still be attempted (even though it rejects)',
    );
  });
});
