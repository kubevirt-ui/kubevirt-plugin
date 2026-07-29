import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseOwnersFile } from './owners';

const SAMPLE_OWNERS = `# Auto-generated
approvers:
  - alice
  - Bob
  - charlie
reviewers:
  - alice
  - dave
  - Eve
`;

describe('parseOwnersFile', () => {
  it('parses approvers and reviewers', () => {
    const result = parseOwnersFile(SAMPLE_OWNERS);
    assert.deepEqual(result.approvers, ['alice', 'Bob', 'charlie']);
    assert.deepEqual(result.reviewers, ['alice', 'dave', 'Eve']);
  });

  it('handles empty content', () => {
    const result = parseOwnersFile('');
    assert.deepEqual(result.approvers, []);
    assert.deepEqual(result.reviewers, []);
  });

  it('handles file with only comments', () => {
    const result = parseOwnersFile('# just a comment\n# another\n');
    assert.deepEqual(result.approvers, []);
    assert.deepEqual(result.reviewers, []);
  });

  it('handles file with only approvers', () => {
    const result = parseOwnersFile('approvers:\n  - user1\n  - user2\n');
    assert.deepEqual(result.approvers, ['user1', 'user2']);
    assert.deepEqual(result.reviewers, []);
  });

  it('stops parsing a section when a non-list line is encountered', () => {
    const content = 'approvers:\n  - user1\nsome_other_key: value\n  - user2\n';
    const result = parseOwnersFile(content);
    assert.deepEqual(result.approvers, ['user1']);
  });
});
