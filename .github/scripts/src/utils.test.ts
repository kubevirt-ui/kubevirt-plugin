import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { requireEnv } from './utils';

describe('requireEnv', () => {
  const KEY = 'REQUIRE_ENV_TEST_VAR';
  const original = process.env[KEY];

  afterEach(() => {
    if (original === undefined) delete process.env[KEY];
    else process.env[KEY] = original;
  });

  it('returns the value when set', () => {
    process.env[KEY] = 'some-value';
    assert.equal(requireEnv(KEY), 'some-value');
  });

  it('throws (does not call process.exit) when unset -- callers rely on catching this to still report failures', () => {
    delete process.env[KEY];
    assert.throws(
      () => requireEnv(KEY),
      /Missing required environment variable: REQUIRE_ENV_TEST_VAR/,
    );
  });

  it('throws when set to an empty string', () => {
    process.env[KEY] = '';
    assert.throws(() => requireEnv(KEY), /Missing required environment variable/);
  });
});
