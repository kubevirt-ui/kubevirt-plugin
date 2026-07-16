import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';

const require = createRequire(__filename);
const {
  APPROVED_LABEL,
  BARE_HOLD_LABEL,
  DO_NOT_MERGE_HOLD_LABEL,
  E2E_HOLD_LABEL,
  LGTM_LABEL,
  NEEDS_REBASE_LABEL,
  isBlockingLabel,
} = require(
  path.join(__dirname, '../../../../../ci-scripts/hot-cluster/js/merge-pool-labels.cjs'),
) as {
  APPROVED_LABEL: string;
  BARE_HOLD_LABEL: string;
  DO_NOT_MERGE_HOLD_LABEL: string;
  E2E_HOLD_LABEL: string;
  LGTM_LABEL: string;
  NEEDS_REBASE_LABEL: string;
  isBlockingLabel: (name: string) => boolean;
};

const { isMergePoolPr } = require(
  path.join(__dirname, '../../../../../ci-scripts/hot-cluster/js/is-merge-pool-pr.cjs'),
) as {
  isMergePoolPr: (labels: Array<string | { name: string }>) => boolean;
};

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
