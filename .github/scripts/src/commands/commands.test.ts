import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseCommand } from './parse-command';

describe('validation comment commands', () => {
  it('detects slash commands in PR comments', () => {
    assert.equal(parseCommand('please /recheck-jira'), 'recheck-jira');
    assert.equal(parseCommand('/ai-approved'), 'ai-approved');
    assert.equal(parseCommand('thanks!'), null);
  });

  it('prefers /recheck-jira over /ai-approved when both are present', () => {
    assert.equal(parseCommand('/recheck-jira and /ai-approved'), 'recheck-jira');
  });
});
