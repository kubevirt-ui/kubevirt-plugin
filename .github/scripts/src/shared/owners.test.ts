import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  getLocalOwnersPath,
  isListedInLocalOwners,
  parseOwnersFile,
  resolveTrustLogin,
} from './owners';

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

describe('getLocalOwnersPath', () => {
  it('resolves OWNERS under GITHUB_WORKSPACE when set', () => {
    const previous = process.env.GITHUB_WORKSPACE;
    process.env.GITHUB_WORKSPACE = '/tmp/fake-workspace';
    try {
      assert.equal(getLocalOwnersPath(), '/tmp/fake-workspace/OWNERS');
      assert.equal(getLocalOwnersPath('.github/OWNERS'), '/tmp/fake-workspace/.github/OWNERS');
    } finally {
      if (previous === undefined) {
        delete process.env.GITHUB_WORKSPACE;
      } else {
        process.env.GITHUB_WORKSPACE = previous;
      }
    }
  });
});

describe('resolveTrustLogin', () => {
  it('prefers triggeredBy only for bot actors on the initial attempt', () => {
    assert.equal(resolveTrustLogin('bot[bot]', 'alice'), 'alice');
    assert.equal(resolveTrustLogin('alice', 'bob'), 'alice');
  });

  it('on rerun prefers triggeringActor over actor and triggeredBy', () => {
    assert.equal(
      resolveTrustLogin('bot[bot]', 'alice', {
        runAttempt: 2,
        triggeringActor: 'eve',
      }),
      'eve',
    );
  });
});

describe('isListedInLocalOwners', () => {
  it('reads the given OWNERS path and matches case-insensitively', () => {
    const dir = mkdtempSync(join(tmpdir(), 'owners-'));
    const ownersPath = join(dir, 'OWNERS');
    writeFileSync(ownersPath, SAMPLE_OWNERS);

    assert.equal(isListedInLocalOwners('alice', ownersPath), true);
    assert.equal(isListedInLocalOwners('BOB', ownersPath), true);
    assert.equal(isListedInLocalOwners('eve', ownersPath), true);
    assert.equal(isListedInLocalOwners('nobody', ownersPath), false);
  });

  it('returns false when the OWNERS file is missing', () => {
    assert.equal(isListedInLocalOwners('alice', '/nonexistent/OWNERS'), false);
  });
});

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
