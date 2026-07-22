import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { getRepoContext, getRunId, getEventName, getRunUrl } from './actions-context';

describe('getRepoContext', () => {
  const KEY = 'GITHUB_REPOSITORY';
  const original = process.env[KEY];

  afterEach(() => {
    if (original === undefined) delete process.env[KEY];
    else process.env[KEY] = original;
  });

  it('parses owner/repo from GITHUB_REPOSITORY', () => {
    process.env[KEY] = 'kubevirt-ui/kubevirt-plugin';
    const ctx = getRepoContext();
    assert.equal(ctx.owner, 'kubevirt-ui');
    assert.equal(ctx.repo, 'kubevirt-plugin');
  });

  it('throws on missing GITHUB_REPOSITORY', () => {
    delete process.env[KEY];
    assert.throws(() => getRepoContext(), /Missing required environment variable/);
  });

  it('throws on malformed GITHUB_REPOSITORY', () => {
    process.env[KEY] = 'no-slash-here';
    assert.throws(() => getRepoContext(), /unexpected format/);
  });
});

describe('getRunId', () => {
  const KEY = 'GITHUB_RUN_ID';
  const original = process.env[KEY];

  afterEach(() => {
    if (original === undefined) delete process.env[KEY];
    else process.env[KEY] = original;
  });

  it('returns the run ID as a number', () => {
    process.env[KEY] = '12345';
    assert.equal(getRunId(), 12345);
  });
});

describe('getEventName', () => {
  const KEY = 'GITHUB_EVENT_NAME';
  const original = process.env[KEY];

  afterEach(() => {
    if (original === undefined) delete process.env[KEY];
    else process.env[KEY] = original;
  });

  it('returns the event name', () => {
    process.env[KEY] = 'pull_request_target';
    assert.equal(getEventName(), 'pull_request_target');
  });
});

describe('getRunUrl', () => {
  const saved: Record<string, string | undefined> = {};
  const keys = ['GITHUB_SERVER_URL', 'GITHUB_REPOSITORY', 'GITHUB_RUN_ID'] as const;

  beforeEach(() => {
    for (const k of keys) saved[k] = process.env[k];
  });

  afterEach(() => {
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it('builds the full run URL', () => {
    process.env.GITHUB_SERVER_URL = 'https://github.com';
    process.env.GITHUB_REPOSITORY = 'kubevirt-ui/kubevirt-plugin';
    process.env.GITHUB_RUN_ID = '99';
    assert.equal(getRunUrl(), 'https://github.com/kubevirt-ui/kubevirt-plugin/actions/runs/99');
  });

  it('defaults server URL to github.com', () => {
    delete process.env.GITHUB_SERVER_URL;
    process.env.GITHUB_REPOSITORY = 'org/repo';
    process.env.GITHUB_RUN_ID = '1';
    assert.equal(getRunUrl(), 'https://github.com/org/repo/actions/runs/1');
  });
});
