// Single source of truth for merge-pool label names. Required by
// is-merge-pool-pr.cjs and sync-needs-rebase-label.cjs; also required by
// .github/scripts review-labels.ts so TS grant/revoke names can't drift.
//
// /hold writes DO_NOT_MERGE_HOLD_LABEL. BARE_HOLD_LABEL is a legacy exact
// name that still blocks the pool if present. Both are covered by
// isBlockingLabel (exact list + do-not-merge/* prefix).

const LGTM_LABEL = 'lgtm';
const APPROVED_LABEL = 'approved';

/** Legacy bare name; still treated as blocking if present on a PR. */
const BARE_HOLD_LABEL = 'hold';
/** Label written by /hold (also blocked via DO_NOT_MERGE_PREFIX). */
const DO_NOT_MERGE_HOLD_LABEL = 'do-not-merge/hold';
const E2E_HOLD_LABEL = 'e2e-hold';
const NEEDS_REBASE_LABEL = 'needs-rebase';
const DO_NOT_MERGE_PREFIX = 'do-not-merge/';

/** Exact label names that alone keep a PR out of the merge pool. */
const BLOCKING_LABELS = Object.freeze([BARE_HOLD_LABEL, E2E_HOLD_LABEL, NEEDS_REBASE_LABEL]);

/** True when `name` is a merge-pool blocking label (exact or do-not-merge/*). */
function isBlockingLabel(name) {
  return BLOCKING_LABELS.includes(name) || name.startsWith(DO_NOT_MERGE_PREFIX);
}

module.exports = {
  LGTM_LABEL,
  APPROVED_LABEL,
  BARE_HOLD_LABEL,
  DO_NOT_MERGE_HOLD_LABEL,
  E2E_HOLD_LABEL,
  NEEDS_REBASE_LABEL,
  DO_NOT_MERGE_PREFIX,
  BLOCKING_LABELS,
  isBlockingLabel,
};
