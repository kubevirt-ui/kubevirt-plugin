import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { buildConfigFromEnv } from './build-config';

const ENV_KEYS = ['GITHUB_TOKEN', 'STATUS_GITHUB_TOKEN', 'REPO_OWNER', 'REPO_NAME'] as const;
const originalEnv: Record<string, string | undefined> = {};
for (const key of ENV_KEYS) originalEnv[key] = process.env[key];

describe('buildConfigFromEnv', () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  });

  it('wires STATUS_GITHUB_TOKEN into statusToken so createStatusOctokit uses the dedicated credential', () => {
    process.env.GITHUB_TOKEN = 'bot-token';
    process.env.STATUS_GITHUB_TOKEN = 'ambient-token';
    process.env.REPO_OWNER = 'kubevirt-ui';
    process.env.REPO_NAME = 'kubevirt-plugin';

    const config = buildConfigFromEnv();

    assert.equal(config.token, 'bot-token');
    assert.equal(config.statusToken, 'ambient-token');
    assert.equal(config.owner, 'kubevirt-ui');
    assert.equal(config.repo, 'kubevirt-plugin');
  });

  it('leaves statusToken undefined when STATUS_GITHUB_TOKEN is not set', () => {
    process.env.GITHUB_TOKEN = 'bot-token';
    delete process.env.STATUS_GITHUB_TOKEN;
    process.env.REPO_OWNER = 'kubevirt-ui';
    process.env.REPO_NAME = 'kubevirt-plugin';

    const config = buildConfigFromEnv();

    assert.equal(config.statusToken, undefined);
  });

  it('normalizes an empty STATUS_GITHUB_TOKEN to undefined so createStatusOctokit falls back to token', () => {
    process.env.GITHUB_TOKEN = 'bot-token';
    process.env.STATUS_GITHUB_TOKEN = '';
    process.env.REPO_OWNER = 'kubevirt-ui';
    process.env.REPO_NAME = 'kubevirt-plugin';

    const config = buildConfigFromEnv();

    assert.equal(config.statusToken, undefined);
  });
});
