import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isBlockingLabel,
  isMergePoolPr,
  getMergePoolBlockers,
  LGTM_LABEL,
  APPROVED_LABEL,
} from './merge-pool';

describe('isBlockingLabel', () => {
  it('blocks exact BLOCKING_LABELS entries', () => {
    assert.equal(isBlockingLabel('hold'), true);
    assert.equal(isBlockingLabel('e2e-hold'), true);
    assert.equal(isBlockingLabel('needs-rebase'), true);
  });

  it('blocks any do-not-merge/* label', () => {
    assert.equal(isBlockingLabel('do-not-merge/hold'), true);
    assert.equal(isBlockingLabel('do-not-merge/jira-invalid'), true);
    assert.equal(isBlockingLabel('do-not-merge/anything'), true);
  });

  it('does not block non-blocking labels', () => {
    assert.equal(isBlockingLabel('lgtm'), false);
    assert.equal(isBlockingLabel('approved'), false);
    assert.equal(isBlockingLabel('e2e-passed'), false);
    assert.equal(isBlockingLabel('random-label'), false);
  });
});

describe('isMergePoolPr', () => {
  it('returns true when lgtm + approved and no blockers', () => {
    assert.equal(isMergePoolPr([LGTM_LABEL, APPROVED_LABEL]), true);
  });

  it('returns false when missing lgtm', () => {
    assert.equal(isMergePoolPr([APPROVED_LABEL]), false);
  });

  it('returns false when missing approved', () => {
    assert.equal(isMergePoolPr([LGTM_LABEL]), false);
  });

  it('returns false when blocking label present', () => {
    assert.equal(isMergePoolPr([LGTM_LABEL, APPROVED_LABEL, 'do-not-merge/hold']), false);
  });

  it('handles label objects (with .name property)', () => {
    assert.equal(
      isMergePoolPr([{ name: LGTM_LABEL }, { name: APPROVED_LABEL }]),
      true,
    );
  });

  it('returns false for empty labels', () => {
    assert.equal(isMergePoolPr([]), false);
  });
});

describe('getMergePoolBlockers', () => {
  it('reports all missing conditions', () => {
    const blockers = getMergePoolBlockers([]);
    assert.equal(blockers.missingLgtm, true);
    assert.equal(blockers.missingApproved, true);
    assert.deepEqual(blockers.blockingLabels, []);
  });

  it('reports blocking labels', () => {
    const blockers = getMergePoolBlockers([LGTM_LABEL, APPROVED_LABEL, 'needs-rebase']);
    assert.equal(blockers.missingLgtm, false);
    assert.equal(blockers.missingApproved, false);
    assert.deepEqual(blockers.blockingLabels, ['needs-rebase']);
  });
});
