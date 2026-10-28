/**
 * Default hot-cluster name for a PR base / dispatch branch.
 * Mirrors ci-scripts/hot-cluster/resolve-cluster-config.sh:
 *   release-X.Y → kubevirt-plugin-XY
 *   anything else (including malformed release-4.21-test) → kubevirt-plugin-ci
 */

/** Exact release-X.Y only — same rule as resolve-cluster-config.sh. */
export const RELEASE_BRANCH_PATTERN = /^release-(\d+)\.(\d+)$/;

export const DEFAULT_HOT_CLUSTER_NAME = 'kubevirt-plugin-ci';

export const isExactReleaseBranch = (ref: string): boolean =>
  RELEASE_BRANCH_PATTERN.test(ref.trim());

export const resolveDefaultClusterName = (baseRef: string): string => {
  const releaseMatch = RELEASE_BRANCH_PATTERN.exec(baseRef.trim());
  if (releaseMatch) {
    return `kubevirt-plugin-${releaseMatch[1]}${releaseMatch[2]}`;
  }
  return DEFAULT_HOT_CLUSTER_NAME;
};

/** Prefer an explicit cluster name; otherwise derive from the branch/base ref. */
export const resolveClusterNameInput = (
  explicitClusterName: string | undefined,
  baseRef: string,
): string => {
  const trimmed = explicitClusterName?.trim();
  if (trimmed) {
    return trimmed;
  }
  return resolveDefaultClusterName(baseRef);
};

/**
 * Second-bracket token for hot-cluster-e2e.yml run-name / teardown matching.
 * Always the resolved cluster name (never a raw base_ref). Malformed
 * release-prefixed refs such as release-4.21-test resolve like main.
 */
export const resolveE2ETitleClusterToken = (
  baseRef: string,
  explicitClusterName?: string,
): string => resolveClusterNameInput(explicitClusterName, baseRef);
