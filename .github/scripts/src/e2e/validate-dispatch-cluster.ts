/**
 * Validate hot-cluster-e2e.yml dispatch inputs for base_ref / cluster_name.
 * Entry point: npx tsx src/e2e/validate-dispatch-cluster.ts
 *
 * Required env: BASE_REF, CLUSTER_NAME_INPUT (optional; defaults to kubevirt-plugin-ci)
 */

import {
  DEFAULT_HOT_CLUSTER_NAME,
  isExactReleaseBranch,
  RELEASE_BRANCH_PATTERN,
  resolveDefaultClusterName,
} from '../commands/resolve-default-cluster-name';
import { failStep } from '../shared/output';

/** Expected cluster when base_ref is exact release-X.Y and cluster_name mismatches. */
export const releaseClusterNameMismatch = (
  baseRef: string,
  clusterName: string,
): null | string => {
  if (!isExactReleaseBranch(baseRef)) {
    return null;
  }
  const expected = resolveDefaultClusterName(baseRef);
  // Compare the raw name — whitespace around an otherwise-correct value is a mismatch.
  return clusterName === expected ? null : expected;
};

/**
 * Returns an error message, or null when the dispatch inputs are valid.
 * cluster_name values such as "main" or "release-test" are allowed on
 * non-release bases — run-name uses [cluster:<name>] so they are unambiguous.
 * Only base_ref is checked for malformed release-* / exact-release mismatch.
 * Trimming is used only to detect a blank cluster_name; nonblank input is preserved.
 */
export const validateDispatchCluster = (
  baseRef: string,
  clusterName: string,
): null | string => {
  const trimmedRef = baseRef.trim();
  const effectiveCluster = clusterName.trim() === '' ? DEFAULT_HOT_CLUSTER_NAME : clusterName;

  if (trimmedRef.startsWith('release-') && !RELEASE_BRANCH_PATTERN.test(trimmedRef)) {
    return `base_ref '${trimmedRef}' looks like a release branch but is not exact release-X.Y`;
  }

  const expected = releaseClusterNameMismatch(trimmedRef, effectiveCluster);
  if (expected) {
    return `Exact release base_ref '${trimmedRef}' requires cluster_name='${expected}' (got '${effectiveCluster}') so the run-name matches the cluster under test. Set cluster_name to '${expected}'.`;
  }

  return null;
};

const main = (): void => {
  const baseRef = process.env.BASE_REF ?? '';
  const clusterName = process.env.CLUSTER_NAME_INPUT || DEFAULT_HOT_CLUSTER_NAME;
  const error = validateDispatchCluster(baseRef, clusterName);
  if (error) {
    failStep(error);
  }
};

if (require.main === module) {
  try {
    main();
  } catch (err) {
    failStep(err instanceof Error ? err.message : String(err));
  }
}
