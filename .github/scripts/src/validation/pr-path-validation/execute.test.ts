import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { HandledValidationError } from './errors';
import { executePathValidation, reportPathValidationError } from './execute';
import type { PathValidationConfig } from './types';

const TEST_CONFIG: PathValidationConfig = {
  commandName: '/test-approved',
  displayName: 'Test validation',
  exactPaths: [],
  labelMeta: {
    alert: { color: 'f59e0b', description: 'alert' },
    block: { color: 'b60205', description: 'block' },
  },
  labels: { alert: 'alert', block: 'block', reviewed: 'reviewed', skip: 'skip' },
  pathPrefixes: ['protected/'],
  statusContext: 'test-validation',
};

const buildStatusDescription = (): string => 'unused';

type Call = { args: unknown; method: string };

type FakeOptions = {
  /** Reject createCommitStatus starting from this call number onward (1-indexed). Ignored when unset. */
  rejectCommitStatusFromCall?: number;
};

/** issues.listLabelsOnIssue throws -- simulating a genuinely unexpected failure inside runPathValidation. */
const fakeOctokitThrowingAfterPending = (calls: Call[], options: FakeOptions = {}): Octokit =>
  ({
    issues: {
      listLabelsOnIssue: async () => {
        calls.push({ args: {}, method: 'issues.listLabelsOnIssue' });
        throw new Error('API rate limit exceeded');
      },
    },
    repos: {
      createCommitStatus: async (args: unknown) => {
        const callNumber = calls.filter((c) => c.method === 'createCommitStatus').length + 1;
        calls.push({ args, method: 'createCommitStatus' });
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
  it('reports a final "error" status when an unexpected error occurs', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokitThrowingAfterPending(calls);

    await assert.rejects(
      executePathValidation(
        {
          baseBranch: 'main',
          config: { owner: 'kubevirt-ui', repo: 'kubevirt-plugin', token: 'x' },
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
      .map((c) => c.args as { context: string; state: string });
    assert.equal(statuses.at(-1)?.state, 'error');
    assert.equal(statuses.at(-1)?.context, 'test-validation');
  });

  it('still rethrows HandledValidationError even when the error status publish itself rejects', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokitThrowingAfterPending(calls, { rejectCommitStatusFromCall: 1 });

    await assert.rejects(
      executePathValidation(
        {
          baseBranch: 'main',
          config: { owner: 'kubevirt-ui', repo: 'kubevirt-plugin', token: 'x' },
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
  it('does not throw', async () => {
    await assert.doesNotReject(
      reportPathValidationError(
        { owner: 'kubevirt-ui', repo: 'kubevirt-plugin', token: 'x' },
        undefined,
        TEST_CONFIG,
        new Error('boom'),
      ),
    );
  });
});
