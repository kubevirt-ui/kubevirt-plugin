import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { buildConfigFromEnv } from './build-config';

const ENV_KEYS = [
  'BOT_TOKEN',
  'GITHUB_TOKEN',
  'STATUS_GITHUB_TOKEN',
  'REPO_OWNER',
  'REPO_NAME',
] as const;
const originalEnv: Record<string, string | undefined> = {};
for (const key of ENV_KEYS) {
  originalEnv[key] = process.env[key];
}

describe('buildConfigFromEnv', () => {
  const originalWarn = console.warn;

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
    console.warn = originalWarn;
  });

  it('prefers BOT_TOKEN for token so do-not-merge/* label clears re-trigger auto-merge.yml', () => {
    process.env.BOT_TOKEN = 'bot-app-token';
    process.env.GITHUB_TOKEN = 'ambient-token';
    process.env.STATUS_GITHUB_TOKEN = 'ambient-token';
    process.env.REPO_OWNER = 'kubevirt-ui';
    process.env.REPO_NAME = 'kubevirt-plugin';

    const config = buildConfigFromEnv();

    assert.equal(config.token, 'bot-app-token');
    assert.equal(config.statusToken, 'ambient-token');
  });

  it('falls back to GITHUB_TOKEN for token when BOT_TOKEN is unset', () => {
    console.warn = () => undefined;
    delete process.env.BOT_TOKEN;
    process.env.GITHUB_TOKEN = 'ambient-token';
    process.env.STATUS_GITHUB_TOKEN = 'ambient-token';
    process.env.REPO_OWNER = 'kubevirt-ui';
    process.env.REPO_NAME = 'kubevirt-plugin';

    const config = buildConfigFromEnv();

    assert.equal(config.token, 'ambient-token');
    assert.equal(config.statusToken, 'ambient-token');
    assert.equal(config.owner, 'kubevirt-ui');
    assert.equal(config.repo, 'kubevirt-plugin');
  });

  it('leaves statusToken undefined when STATUS_GITHUB_TOKEN is not set', () => {
    process.env.BOT_TOKEN = 'bot-app-token';
    delete process.env.STATUS_GITHUB_TOKEN;
    process.env.REPO_OWNER = 'kubevirt-ui';
    process.env.REPO_NAME = 'kubevirt-plugin';

    const config = buildConfigFromEnv();

    assert.equal(config.statusToken, undefined);
  });

  it('normalizes an empty STATUS_GITHUB_TOKEN to undefined so createStatusOctokit falls back to token', () => {
    process.env.BOT_TOKEN = 'bot-app-token';
    process.env.STATUS_GITHUB_TOKEN = '';
    process.env.REPO_OWNER = 'kubevirt-ui';
    process.env.REPO_NAME = 'kubevirt-plugin';

    const config = buildConfigFromEnv();

    assert.equal(config.statusToken, undefined);
  });
});
