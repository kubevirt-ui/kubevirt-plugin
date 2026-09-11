import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildCherryPickArgs } from './git-helpers';

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
