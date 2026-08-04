import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  computeNextVersion,
  getExpectedVersionForBranch,
  MAIN_MIN_FIX_VERSION,
} from './version-compare';

describe('getExpectedVersionForBranch', () => {
  it('returns the release version for release branches', () => {
    assert.equal(getExpectedVersionForBranch('release-4.22', []), '4.22');
    assert.equal(getExpectedVersionForBranch('release-5.0', ['release-4.22']), '5.0');
  });

  it('floors main at 5.0 when the highest release branch is still 4.x', () => {
    assert.equal(MAIN_MIN_FIX_VERSION, '5.0');
    assert.equal(computeNextVersion('4.22'), '4.23');
    assert.equal(getExpectedVersionForBranch('main', ['release-4.21', 'release-4.22']), '5.0');
  });

  it('uses MAIN_MIN_FIX_VERSION when no release branches exist', () => {
    assert.equal(getExpectedVersionForBranch('main', []), MAIN_MIN_FIX_VERSION);
  });

  it('uses the computed next version once release branches reach 5.x', () => {
    assert.equal(getExpectedVersionForBranch('main', ['release-4.22', 'release-5.0']), '5.1');
  });

  it('returns null for non-main, non-release branches', () => {
    assert.equal(getExpectedVersionForBranch('feature/foo', ['release-4.22']), null);
  });
});
