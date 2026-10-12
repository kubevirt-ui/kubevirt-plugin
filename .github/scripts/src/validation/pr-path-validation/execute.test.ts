import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { HandledValidationError } from './errors';
import { executePathValidation } from './execute';
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
};

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
          config: { owner: 'kubevirt-ui', repo: 'kubevirt-plugin', token: 'x' },
          files: [{ filename: 'protected/foo.ts' }],
          octokit,
          prNumber: 1,
          statusOctokit: octokit,
        },
        TEST_CONFIG,
      ),
      HandledValidationError,
    );
  });
});
