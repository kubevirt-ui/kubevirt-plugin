// Single source of truth for "is this PR in the hot-cluster-e2e merge pool"
// (lgtm + approved, no blocking labels). Shared by retest-stale-gating.yml
// (initial classification) and hot-cluster-e2e.yml's resolve-pr-context step
// (fresh re-verification right before the credentialed cluster run).
const { APPROVED_LABEL, LGTM_LABEL, isBlockingLabel } = require('./merge-pool-labels.cjs');

// Breaks isMergePoolPr's single boolean down into which specific condition(s)
// are unmet -- used by auto-merge.yml to report a specific reason on the
// Merge Gate check instead of one generic sentence.
function getMergePoolBlockers(labels) {
  const names = (labels || []).map((label) => (typeof label === 'string' ? label : label.name));
  return {
    missingLgtm: !names.includes(LGTM_LABEL),
    missingApproved: !names.includes(APPROVED_LABEL),
    blockingLabels: names.filter(isBlockingLabel),
  };
}

function isMergePoolPr(labels) {
  const { missingLgtm, missingApproved, blockingLabels } = getMergePoolBlockers(labels);
  return !missingLgtm && !missingApproved && blockingLabels.length === 0;
}

module.exports = { getMergePoolBlockers, isMergePoolPr };
