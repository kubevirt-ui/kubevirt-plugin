// Single source of truth for "is this PR in the hot-cluster-e2e merge pool"
// (lgtm + approved, no hold/do-not-merge/*/e2e-hold). Shared by
// retest-stale-gating.yml (initial classification) and
// hot-cluster-e2e.yml's resolve-pr-context step (fresh re-verification
// right before the credentialed cluster run). e2e-hold (set by /hold-e2e)
// is included here so a held-but-lgtm+approved PR doesn't get a real
// retest dispatched the moment main advances -- only /retest-e2e should
// trigger a new run while held.
function isMergePoolPr(labels) {
  const names = (labels || []).map((label) => (typeof label === 'string' ? label : label.name));
  const hasHold = names.some(
    (name) => name === 'hold' || name === 'e2e-hold' || name.startsWith('do-not-merge/'),
  );
  return names.includes('lgtm') && names.includes('approved') && !hasHold;
}

module.exports = { isMergePoolPr };
