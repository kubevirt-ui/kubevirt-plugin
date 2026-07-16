// Single source of truth for "is this PR in the hot-cluster-e2e merge pool"
// (lgtm + approved, no blocking labels). Shared by retest-stale-gating.yml
// (initial classification) and hot-cluster-e2e.yml's resolve-pr-context step
// (fresh re-verification right before the credentialed cluster run).
const { APPROVED_LABEL, LGTM_LABEL, isBlockingLabel } = require('./merge-pool-labels.cjs');

function isMergePoolPr(labels) {
  const names = (labels || []).map((label) => (typeof label === 'string' ? label : label.name));
  const hasHold = names.some(isBlockingLabel);
  return names.includes(LGTM_LABEL) && names.includes(APPROVED_LABEL) && !hasHold;
}

module.exports = { isMergePoolPr };
