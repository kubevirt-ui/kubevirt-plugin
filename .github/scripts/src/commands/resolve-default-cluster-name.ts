/**
 * Default hot-cluster name for a PR base / dispatch branch.
 * Mirrors ci-scripts/hot-cluster/resolve-cluster-config.sh:
 *   release-X.Y → kubevirt-plugin-XY
 *   anything else → kubevirt-plugin-ci
 */

export const DEFAULT_HOT_CLUSTER_NAME = 'kubevirt-plugin-ci';

export const resolveDefaultClusterName = (baseRef: string): string => {
  const releaseMatch = /^release-(\d+)\.(\d+)$/.exec(baseRef.trim());
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
