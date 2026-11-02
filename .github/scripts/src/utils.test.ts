import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { requireEnv, resolveLabelWriteToken } from './utils';

describe('requireEnv', () => {
  const KEY = 'REQUIRE_ENV_TEST_VAR';
  const original = process.env[KEY];

  afterEach(() => {
    if (original === undefined) {
      delete process.env[KEY];
    } else {
      process.env[KEY] = original;
    }
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

describe('resolveLabelWriteToken', () => {
  const TOKEN_KEYS = ['BOT_TOKEN', 'GITHUB_TOKEN'] as const;
  const original: Record<string, string | undefined> = {};
  for (const key of TOKEN_KEYS) {
    original[key] = process.env[key];
  }
  const originalWarn = console.warn;
  const warnCalls: unknown[][] = [];

  afterEach(() => {
    for (const key of TOKEN_KEYS) {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    }
    console.warn = originalWarn;
    warnCalls.length = 0;
  });

  const stubWarn = (): void => {
    console.warn = (...args: unknown[]): void => {
      warnCalls.push(args);
    };
  };

  it('prefers BOT_TOKEN when set, without warning or touching GITHUB_TOKEN', () => {
    stubWarn();
    process.env.BOT_TOKEN = 'bot-app-token';
    process.env.GITHUB_TOKEN = 'ambient-token';

    assert.equal(resolveLabelWriteToken(), 'bot-app-token');
    assert.equal(warnCalls.length, 0, 'should not warn when BOT_TOKEN is present');
  });

  it('falls back to GITHUB_TOKEN and warns when BOT_TOKEN is unset', () => {
    stubWarn();
    delete process.env.BOT_TOKEN;
    process.env.GITHUB_TOKEN = 'ambient-token';

    assert.equal(resolveLabelWriteToken(), 'ambient-token');
    assert.equal(warnCalls.length, 1);
    assert.match(String(warnCalls[0][0]), /will NOT.*re-trigger auto-merge\.yml/s);
  });

  it('falls back to GITHUB_TOKEN and warns when BOT_TOKEN is an empty string', () => {
    stubWarn();
    process.env.BOT_TOKEN = '';
    process.env.GITHUB_TOKEN = 'ambient-token';

    assert.equal(resolveLabelWriteToken(), 'ambient-token');
    assert.equal(warnCalls.length, 1);
  });

  it('throws when neither BOT_TOKEN nor GITHUB_TOKEN is set', () => {
    stubWarn();
    delete process.env.BOT_TOKEN;
    delete process.env.GITHUB_TOKEN;

    assert.throws(
      () => resolveLabelWriteToken(),
      /Missing required environment variable: GITHUB_TOKEN/,
    );
  });
});
