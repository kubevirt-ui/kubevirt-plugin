// Single source of truth for "is this PR in the hot-cluster-e2e merge pool"
// (lgtm + approved, no hold/do-not-merge/*). Shared by
// retest-stale-gating.yml (initial classification) and
// hot-cluster-e2e.yml's resolve-pr-context step (fresh re-verification
// right before the credentialed cluster run).
function isMergePoolPr(labels) {
  const names = (labels || []).map((label) => (typeof label === 'string' ? label : label.name));
  const hasHold = names.some((name) => name === 'hold' || name.startsWith('do-not-merge/'));
  return names.includes('lgtm') && names.includes('approved') && !hasHold;
}

module.exports = { isMergePoolPr };
