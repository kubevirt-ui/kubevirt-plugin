import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseCommand } from './parse-command';

describe('validation comment commands', () => {
  it('detects slash commands in PR comments', () => {
    assert.deepEqual(parseCommand('please /recheck-jira'), ['recheck-jira']);
    assert.deepEqual(parseCommand('/ai-approved'), ['ai-approved']);
    assert.deepEqual(parseCommand('/ci-approved'), ['ci-approved']);
    assert.deepEqual(parseCommand('thanks!'), []);
  });

  it('returns every matched command, in a fixed order, when more than one is present', () => {
    assert.deepEqual(parseCommand('/recheck-jira and /ai-approved'), [
      'recheck-jira',
      'ai-approved',
    ]);
    assert.deepEqual(parseCommand('/ai-approved /ci-approved'), ['ai-approved', 'ci-approved']);
    assert.deepEqual(parseCommand('/recheck-jira /ai-approved /ci-approved'), [
      'recheck-jira',
      'ai-approved',
      'ci-approved',
    ]);
  });

  it('rejects suffixes, prefixes, embedded paths, and URLs for every command', () => {
    assert.deepEqual(parseCommand('/recheck-jira-now'), []);
    assert.deepEqual(parseCommand('/ai-approved-extra'), []);
    assert.deepEqual(parseCommand('/ci-approved!'), []);
    assert.deepEqual(parseCommand('please/recheck-jira'), []);
    assert.deepEqual(parseCommand('path/ai-approved'), []);
    assert.deepEqual(parseCommand('prefix/ci-approved'), []);
    assert.deepEqual(parseCommand('https://example.com/recheck-jira'), []);
    assert.deepEqual(parseCommand('https://example.com/ai-approved'), []);
    assert.deepEqual(parseCommand('https://example.com/ci-approved'), []);
    assert.deepEqual(parseCommand('see /recheck-jirafoo'), []);
  });
});

describe('lgtm/approve/hold and their cancel variants', () => {
  it('detects the plain form of each command', () => {
    assert.deepEqual(parseCommand('/lgtm'), ['lgtm']);
    assert.deepEqual(parseCommand('/approve'), ['approve']);
    assert.deepEqual(parseCommand('/hold'), ['hold']);
  });

  it('detects the "cancel" argument, space-separated only', () => {
    assert.deepEqual(parseCommand('/lgtm cancel'), ['lgtm-cancel']);
    assert.deepEqual(parseCommand('/approve cancel'), ['approve-cancel']);
    assert.deepEqual(parseCommand('/hold cancel'), ['hold-cancel']);
    // Hyphenated (no space) isn't the real syntax -- rejected, not treated
    // as a plain command either.
    assert.deepEqual(parseCommand('/lgtm-cancel'), []);
    assert.deepEqual(parseCommand('/approve-cancel'), []);
    assert.deepEqual(parseCommand('/hold-cancel'), []);
  });

  it('never confuses /hold-e2e (an unrelated, existing command) with /hold', () => {
    assert.deepEqual(parseCommand('/hold-e2e'), []);
    assert.deepEqual(parseCommand('/hold-e2e cancel'), []);
  });

  it('never confuses /ai-approved or /ci-approved with /approve', () => {
    assert.deepEqual(parseCommand('/ai-approved'), ['ai-approved']);
    assert.deepEqual(parseCommand('/ci-approved'), ['ci-approved']);
    assert.deepEqual(parseCommand('/approved'), []);
  });

  it('returns multiple commands together, in the fixed order', () => {
    assert.deepEqual(parseCommand('/lgtm /approve /hold'), ['lgtm', 'approve', 'hold']);
    assert.deepEqual(parseCommand('/hold cancel /lgtm cancel'), ['lgtm-cancel', 'hold-cancel']);
  });
});
