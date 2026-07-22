import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { requireEnv, withRetry } from './kube-client';

describe('requireEnv', () => {
  const KEY = 'KUBE_CLIENT_TEST_VAR';
  const original = process.env[KEY];

  it('returns the value when set', () => {
    process.env[KEY] = 'test-value';
    assert.equal(requireEnv(KEY), 'test-value');
    if (original === undefined) delete process.env[KEY];
    else process.env[KEY] = original;
  });

  it('throws when unset', () => {
    delete process.env[KEY];
    assert.throws(() => requireEnv(KEY), /Missing required environment variable/);
    if (original !== undefined) process.env[KEY] = original;
  });
});

describe('withRetry', () => {
  it('returns the value on success', async () => {
    const result = await withRetry(async () => 42, 'test');
    assert.equal(result, 42);
  });

  it('retries on retryable status codes', async () => {
    let attempts = 0;
    const result = await withRetry(
      async () => {
        attempts++;
        if (attempts < 3) {
          const err = new Error('conflict') as Error & { statusCode: number };
          err.statusCode = 409;
          throw err;
        }
        return 'ok';
      },
      'retry-test',
      5,
    );
    assert.equal(result, 'ok');
    assert.equal(attempts, 3);
  });

  it('throws immediately on non-retryable errors', async () => {
    await assert.rejects(
      () =>
        withRetry(async () => {
          const err = new Error('not found') as Error & { statusCode: number };
          err.statusCode = 404;
          throw err;
        }, 'no-retry-test'),
      /not found/,
    );
  });

  it('throws after max retries', async () => {
    await assert.rejects(
      () =>
        withRetry(
          async () => {
            const err = new Error('unavailable') as Error & { statusCode: number };
            err.statusCode = 503;
            throw err;
          },
          'max-retry-test',
          2,
        ),
      /unavailable/,
    );
  });
});
