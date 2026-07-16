import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { runChecksIsolated } from './run-checks';
import type { PrValidationCheck } from './run-checks';
import { HandledValidationError } from '../pr-path-validation/errors';
import type { GitHubConfig } from '../../types/index';

const CONFIG: GitHubConfig = { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' };

const buildCheck = (
  name: string,
  overrides: Partial<PrValidationCheck> = {},
  reported: string[] = [],
): PrValidationCheck => ({
  name,
  reportUnexpectedError: async () => {
    reported.push(name);
  },
  run: async () => {},
  ...overrides,
});

describe('runChecksIsolated', () => {
  it('runs every check independently even when one fails', async () => {
    const ran: string[] = [];
    const checks: PrValidationCheck[] = [
      buildCheck('jira-validation', {
        run: async () => {
          ran.push('jira-validation');
          throw new Error('Jira API unreachable');
        },
      }),
      buildCheck('ai-config-validation', {
        run: async () => {
          ran.push('ai-config-validation');
        },
      }),
      buildCheck('ci-scripts-validation', {
        run: async () => {
          ran.push('ci-scripts-validation');
        },
      }),
    ];

    await runChecksIsolated(checks, CONFIG, 'abc123');

    assert.deepEqual(ran, ['jira-validation', 'ai-config-validation', 'ci-scripts-validation']);
  });

  it('does not call reportUnexpectedError for a HandledValidationError -- the check already reported its own status', async () => {
    const reported: string[] = [];
    const checks: PrValidationCheck[] = [
      buildCheck(
        'ai-config-validation',
        {
          run: async () => {
            throw new HandledValidationError('AI configuration validation failed.');
          },
        },
        reported,
      ),
    ];

    const anyFailed = await runChecksIsolated(checks, CONFIG, 'abc123');

    assert.equal(anyFailed, true);
    assert.deepEqual(reported, []);
  });

  it('calls reportUnexpectedError for a genuinely unexpected error', async () => {
    const reported: string[] = [];
    const checks: PrValidationCheck[] = [
      buildCheck(
        'ci-scripts-validation',
        {
          run: async () => {
            throw new Error('network timeout');
          },
        },
        reported,
      ),
    ];

    const anyFailed = await runChecksIsolated(checks, CONFIG, 'abc123');

    assert.equal(anyFailed, true);
    assert.deepEqual(reported, ['ci-scripts-validation']);
  });

  it('returns false when every check succeeds', async () => {
    const checks: PrValidationCheck[] = [
      buildCheck('jira-validation'),
      buildCheck('ai-config-validation'),
      buildCheck('ci-scripts-validation'),
    ];

    const anyFailed = await runChecksIsolated(checks, CONFIG, 'abc123');

    assert.equal(anyFailed, false);
  });

  it('returns true when at least one check fails, regardless of the others', async () => {
    const checks: PrValidationCheck[] = [
      buildCheck('jira-validation'),
      buildCheck('ai-config-validation', {
        run: async () => {
          throw new HandledValidationError('AI configuration validation failed.');
        },
      }),
      buildCheck('ci-scripts-validation'),
    ];

    const anyFailed = await runChecksIsolated(checks, CONFIG, 'abc123');

    assert.equal(anyFailed, true);
  });

  it('still reports and counts a later failed check even when an earlier reportUnexpectedError rejects', async () => {
    const reported: string[] = [];
    const checks: PrValidationCheck[] = [
      buildCheck('jira-validation', {
        reportUnexpectedError: async () => {
          reported.push('jira-validation');
          throw new Error('failed to post status');
        },
        run: async () => {
          throw new Error('jira API unreachable');
        },
      }),
      buildCheck(
        'ai-config-validation',
        {
          run: async () => {
            throw new Error('network timeout');
          },
        },
        reported,
      ),
    ];

    const anyFailed = await runChecksIsolated(checks, CONFIG, 'abc123');

    assert.equal(anyFailed, true);
    assert.deepEqual(reported, ['jira-validation', 'ai-config-validation']);
  });

  it('demonstrates the shared-fetch pattern: an independent check still runs and succeeds when a promise shared by other checks rejects', async () => {
    const filesPromise = Promise.reject(new Error('getPullRequestFiles failed'));
    const reported: string[] = [];
    const checks: PrValidationCheck[] = [
      buildCheck('jira-validation', {
        // Doesn't await filesPromise -- must succeed independent of it.
        run: async () => {},
      }),
      buildCheck(
        'ai-config-validation',
        {
          run: async () => {
            await filesPromise;
          },
        },
        reported,
      ),
      buildCheck(
        'ci-scripts-validation',
        {
          run: async () => {
            await filesPromise;
          },
        },
        reported,
      ),
    ];

    const anyFailed = await runChecksIsolated(checks, CONFIG, 'abc123');

    assert.equal(anyFailed, true);
    assert.deepEqual(reported, ['ai-config-validation', 'ci-scripts-validation']);
  });

  it('isolates a synchronously throwing check so later checks still run and report', async () => {
    const ran: string[] = [];
    const reported: string[] = [];
    const checks: PrValidationCheck[] = [
      buildCheck(
        'jira-validation',
        {
          run: (() => {
            ran.push('jira-validation');
            throw new Error('sync boom');
          }) as () => Promise<void>,
        },
        reported,
      ),
      buildCheck('ai-config-validation', {
        run: async () => {
          ran.push('ai-config-validation');
        },
      }),
      buildCheck('ci-scripts-validation', {
        run: async () => {
          ran.push('ci-scripts-validation');
        },
      }),
    ];

    const anyFailed = await runChecksIsolated(checks, CONFIG, 'abc123');

    assert.equal(anyFailed, true);
    assert.deepEqual(ran, ['jira-validation', 'ai-config-validation', 'ci-scripts-validation']);
    assert.deepEqual(reported, ['jira-validation']);
  });
});
