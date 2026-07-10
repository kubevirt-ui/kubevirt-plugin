// Single source of truth for "is this PR in the hot-cluster-e2e merge pool"
// (lgtm + approved, no hold/do-not-merge/*). Shared by:
//   - .github/workflows/retest-stale-gating.yml's list-open-prs job (initial
//     classification, decides which PRs get a real retest dispatched)
//   - .github/workflows/hot-cluster-e2e.yml's resolve-pr-context job (fresh
//     re-verification at execution time, right before the credentialed
//     cluster run -- closes the gap between "labels were checked" and
//     "cluster time was spent" so a label removed in between is caught)
//
// Keeping this in one file (rather than duplicating the predicate inline in
// two separate workflow scripts) means the trust boundary can't silently
// drift out of sync between the two check points.
function isMergePoolPr(labels) {
  const names = (labels || []).map((label) => (typeof label === 'string' ? label : label.name));
  const hasHold = names.some((name) => name === 'hold' || name.startsWith('do-not-merge/'));
  return names.includes('lgtm') && names.includes('approved') && !hasHold;
}

module.exports = { isMergePoolPr };
