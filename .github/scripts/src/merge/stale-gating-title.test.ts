import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatStaleGatingTitle, isStaleGatingTitle } from './stale-gating-title';

describe('formatStaleGatingTitle', () => {
  it('embeds the base ref', () => {
    assert.equal(
      formatStaleGatingTitle('main'),
      'Hot Cluster E2E: stale -- main has advanced since this ran',
    );
    assert.equal(
      formatStaleGatingTitle('release-4.22'),
      'Hot Cluster E2E: stale -- release-4.22 has advanced since this ran',
    );
  });
});

describe('isStaleGatingTitle', () => {
  it('accepts formatted titles for main and release bases', () => {
    assert.equal(isStaleGatingTitle(formatStaleGatingTitle('main')), true);
    assert.equal(isStaleGatingTitle(formatStaleGatingTitle('release-4.23')), true);
  });

  it('rejects non-stale titles', () => {
    assert.equal(isStaleGatingTitle(undefined), false);
    assert.equal(isStaleGatingTitle(''), false);
    assert.equal(isStaleGatingTitle('Hot Cluster E2E is running'), false);
    assert.equal(isStaleGatingTitle('Hot Cluster E2E: held via /hold-e2e'), false);
    assert.equal(isStaleGatingTitle('Stale -- main has advanced since this ran'), false);
  });
});
