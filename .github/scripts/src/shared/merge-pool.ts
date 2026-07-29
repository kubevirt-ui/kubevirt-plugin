/**
 * Merge-pool label constants and eligibility logic.
 * Canonical TS source — replaces ci-scripts/hot-cluster/js/merge-pool-labels.cjs
 * and ci-scripts/hot-cluster/js/is-merge-pool-pr.cjs.
 */

export const LGTM_LABEL = 'lgtm';
export const APPROVED_LABEL = 'approved';

/** Legacy bare name; still treated as blocking if present. */
export const BARE_HOLD_LABEL = 'hold';
/** Label written by /hold (also blocked via DO_NOT_MERGE_PREFIX). */
export const DO_NOT_MERGE_HOLD_LABEL = 'do-not-merge/hold';
export const E2E_HOLD_LABEL = 'e2e-hold';
export const NEEDS_REBASE_LABEL = 'needs-rebase';
export const DO_NOT_MERGE_PREFIX = 'do-not-merge/';

export const E2E_PASSED_LABEL = 'e2e-passed';
export const E2E_FAILED_LABEL = 'e2e-failed';

/** Exact label names that alone keep a PR out of the merge pool. */
export const BLOCKING_LABELS = Object.freeze([
  BARE_HOLD_LABEL,
  E2E_HOLD_LABEL,
  NEEDS_REBASE_LABEL,
] as const);

/** True when `name` is a merge-pool blocking label (exact or do-not-merge/*). */
export const isBlockingLabel = (name: string): boolean =>
  (BLOCKING_LABELS as readonly string[]).includes(name) || name.startsWith(DO_NOT_MERGE_PREFIX);

type LabelInput = { name: string } | string;

const toLabelNames = (labels: LabelInput[]): string[] =>
  labels.map((label) => (typeof label === 'string' ? label : label.name));

export type MergePoolBlockers = {
  blockingLabels: string[];
  missingApproved: boolean;
  missingLgtm: boolean;
};

/** Break down which specific merge-pool conditions are unmet. */
export const getMergePoolBlockers = (labels: LabelInput[]): MergePoolBlockers => {
  const names = toLabelNames(labels);
  return {
    blockingLabels: names.filter(isBlockingLabel),
    missingApproved: !names.includes(APPROVED_LABEL),
    missingLgtm: !names.includes(LGTM_LABEL),
  };
};

/** True when a PR carries lgtm + approved and no blocking labels. */
export const isMergePoolPr = (labels: LabelInput[]): boolean => {
  const { blockingLabels, missingApproved, missingLgtm } = getMergePoolBlockers(labels);
  return !missingLgtm && !missingApproved && blockingLabels.length === 0;
};
