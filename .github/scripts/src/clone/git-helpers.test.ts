import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildCherryPickArgs, GitCommandError, redactCredentials } from './git-helpers';

describe('redactCredentials', () => {
  it('redacts token-bearing remote URLs', () => {
    const input =
      'remote set-url origin https://x-access-token:ghp_secret@github.com/owner/repo.git';
    assert.equal(
      redactCredentials(input),
      'remote set-url origin https://[REDACTED]@github.com/owner/repo.git',
    );
  });
});

describe('GitCommandError', () => {
  it('redacts credentials from command and stderr', () => {
    const token = 'ghp_super_secret_token';
    const command = `remote set-url origin https://x-access-token:${token}@github.com/owner/repo.git`;
    const stderr = `fatal: could not set remote: ${command}`;
    const err = new GitCommandError(command, stderr);

    assert.doesNotMatch(err.message, /ghp_super_secret_token/);
    assert.doesNotMatch(err.command, /ghp_super_secret_token/);
    assert.doesNotMatch(err.stderr, /ghp_super_secret_token/);
    assert.match(err.command, /\[REDACTED\]/);
  });
});

describe('buildCherryPickArgs', () => {
  it('uses -m 1 for merge commits', () => {
    assert.deepEqual(buildCherryPickArgs('abc123', true), [
      'cherry-pick',
      '-m',
      '1',
      'abc123',
      '--allow-empty',
    ]);
  });

  it('omits -m 1 for regular commits', () => {
    assert.deepEqual(buildCherryPickArgs('abc123', false), [
      'cherry-pick',
      'abc123',
      '--allow-empty',
    ]);
  });
});
