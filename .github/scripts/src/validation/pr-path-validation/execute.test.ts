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

/** issues.listLabelsOnIssue throws -- simulating a genuinely unexpected failure inside runPathValidation. */
const fakeOctokitThrowing = (): Octokit =>
  ({
    issues: {
      listLabelsOnIssue: async () => {
        throw new Error('API rate limit exceeded');
      },
    },
  }) as unknown as Octokit;

describe('executePathValidation', () => {
  it('wraps unexpected errors in HandledValidationError', async () => {
    const octokit = fakeOctokitThrowing();

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
  it('does not throw', async () => {
    await assert.doesNotReject(
      reportPathValidationError(
        { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
        'abc123',
        TEST_CONFIG,
        new Error('boom'),
      ),
    );
  });
});
