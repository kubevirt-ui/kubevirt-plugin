import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HandledValidationError } from '../pr-path-validation/errors';
import type { PrValidationCheck } from './run-checks';
import { runChecksIsolated } from './run-checks';

const buildCheck = (
  name: string,
  overrides: Partial<PrValidationCheck> = {},
): PrValidationCheck => ({
  name,
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

    await runChecksIsolated(checks);

    assert.deepEqual(ran, ['jira-validation', 'ai-config-validation', 'ci-scripts-validation']);
  });

  it('returns true for a HandledValidationError without aborting other checks', async () => {
    const checks: PrValidationCheck[] = [
      buildCheck('ai-config-validation', {
        run: async () => {
          throw new HandledValidationError('AI configuration validation failed.');
        },
      }),
      buildCheck('ci-scripts-validation'),
    ];

    const anyFailed = await runChecksIsolated(checks);

    assert.equal(anyFailed, true);
  });

  it('returns true for a genuinely unexpected error', async () => {
    const checks: PrValidationCheck[] = [
      buildCheck('ci-scripts-validation', {
        run: async () => {
          throw new Error('network timeout');
        },
      }),
    ];

    const anyFailed = await runChecksIsolated(checks);

    assert.equal(anyFailed, true);
  });

  it('returns false when every check succeeds', async () => {
    const checks: PrValidationCheck[] = [
      buildCheck('jira-validation'),
      buildCheck('ai-config-validation'),
      buildCheck('ci-scripts-validation'),
    ];

    const anyFailed = await runChecksIsolated(checks);

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

    const anyFailed = await runChecksIsolated(checks);

    assert.equal(anyFailed, true);
  });

  it('demonstrates the shared-fetch pattern: an independent check still runs and succeeds when a promise shared by other checks rejects', async () => {
    const filesPromise = Promise.reject(new Error('getPullRequestFiles failed'));
    const checks: PrValidationCheck[] = [
      buildCheck('jira-validation', {
        // Doesn't await filesPromise -- must succeed independent of it.
        run: async () => {},
      }),
      buildCheck('ai-config-validation', {
        run: async () => {
          await filesPromise;
        },
      }),
      buildCheck('ci-scripts-validation', {
        run: async () => {
          await filesPromise;
        },
      }),
    ];

    const anyFailed = await runChecksIsolated(checks);

    assert.equal(anyFailed, true);
  });

  it('isolates a synchronously throwing check so later checks still run', async () => {
    const ran: string[] = [];
    const checks: PrValidationCheck[] = [
      buildCheck('jira-validation', {
        run: (() => {
          ran.push('jira-validation');
          throw new Error('sync boom');
        }) as () => Promise<void>,
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

    const anyFailed = await runChecksIsolated(checks);

    assert.equal(anyFailed, true);
    assert.deepEqual(ran, ['jira-validation', 'ai-config-validation', 'ci-scripts-validation']);
  });
});
