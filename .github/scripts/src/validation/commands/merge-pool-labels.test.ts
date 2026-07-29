import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  APPROVED_LABEL,
  BARE_HOLD_LABEL,
  DO_NOT_MERGE_HOLD_LABEL,
  E2E_HOLD_LABEL,
  getMergePoolBlockers,
  isBlockingLabel,
  isMergePoolPr,
  LGTM_LABEL,
  NEEDS_REBASE_LABEL,
} from '../../shared/merge-pool';

describe('isBlockingLabel', () => {
  it('blocks exact and do-not-merge/* names', () => {
    assert.equal(isBlockingLabel(BARE_HOLD_LABEL), true);
    assert.equal(isBlockingLabel(E2E_HOLD_LABEL), true);
    assert.equal(isBlockingLabel(NEEDS_REBASE_LABEL), true);
    assert.equal(isBlockingLabel(DO_NOT_MERGE_HOLD_LABEL), true);
    assert.equal(isBlockingLabel('do-not-merge/ai-config-review'), true);
    assert.equal(isBlockingLabel(LGTM_LABEL), false);
    assert.equal(isBlockingLabel(APPROVED_LABEL), false);
  });
});

describe('isMergePoolPr', () => {
  it('requires lgtm + approved with no blockers', () => {
    assert.equal(isMergePoolPr([LGTM_LABEL, APPROVED_LABEL]), true);
    assert.equal(isMergePoolPr([{ name: LGTM_LABEL }, { name: APPROVED_LABEL }]), true);
  });

  it('rejects missing required labels or any blocker', () => {
    assert.equal(isMergePoolPr([LGTM_LABEL]), false);
    assert.equal(isMergePoolPr([APPROVED_LABEL]), false);
    assert.equal(isMergePoolPr([LGTM_LABEL, APPROVED_LABEL, BARE_HOLD_LABEL]), false);
    assert.equal(isMergePoolPr([LGTM_LABEL, APPROVED_LABEL, DO_NOT_MERGE_HOLD_LABEL]), false);
    assert.equal(isMergePoolPr([LGTM_LABEL, APPROVED_LABEL, E2E_HOLD_LABEL]), false);
    assert.equal(isMergePoolPr([LGTM_LABEL, APPROVED_LABEL, NEEDS_REBASE_LABEL]), false);
  });
});

describe('getMergePoolBlockers', () => {
  it('reports no blockers for lgtm + approved with no blocking label', () => {
    assert.deepEqual(getMergePoolBlockers([LGTM_LABEL, APPROVED_LABEL]), {
      blockingLabels: [],
      missingApproved: false,
      missingLgtm: false,
    });
    assert.deepEqual(getMergePoolBlockers([{ name: LGTM_LABEL }, { name: APPROVED_LABEL }]), {
      blockingLabels: [],
      missingApproved: false,
      missingLgtm: false,
    });
  });

  it('reports missingLgtm/missingApproved independently when no labels are present', () => {
    assert.deepEqual(getMergePoolBlockers([]), {
      blockingLabels: [],
      missingApproved: true,
      missingLgtm: true,
    });
    assert.deepEqual(getMergePoolBlockers([LGTM_LABEL]), {
      blockingLabels: [],
      missingApproved: true,
      missingLgtm: false,
    });
    assert.deepEqual(getMergePoolBlockers([APPROVED_LABEL]), {
      blockingLabels: [],
      missingApproved: false,
      missingLgtm: true,
    });
  });

  it('collects each individual blocking label', () => {
    assert.deepEqual(
      getMergePoolBlockers([LGTM_LABEL, APPROVED_LABEL, BARE_HOLD_LABEL]).blockingLabels,
      [BARE_HOLD_LABEL],
    );
    assert.deepEqual(
      getMergePoolBlockers([LGTM_LABEL, APPROVED_LABEL, DO_NOT_MERGE_HOLD_LABEL]).blockingLabels,
      [DO_NOT_MERGE_HOLD_LABEL],
    );
    assert.deepEqual(
      getMergePoolBlockers([LGTM_LABEL, APPROVED_LABEL, E2E_HOLD_LABEL]).blockingLabels,
      [E2E_HOLD_LABEL],
    );
    assert.deepEqual(
      getMergePoolBlockers([LGTM_LABEL, APPROVED_LABEL, NEEDS_REBASE_LABEL]).blockingLabels,
      [NEEDS_REBASE_LABEL],
    );
  });

  it('collects multiple simultaneous blockers, including missing labels', () => {
    assert.deepEqual(getMergePoolBlockers([E2E_HOLD_LABEL, NEEDS_REBASE_LABEL]), {
      blockingLabels: [E2E_HOLD_LABEL, NEEDS_REBASE_LABEL],
      missingApproved: true,
      missingLgtm: true,
    });
  });
});
