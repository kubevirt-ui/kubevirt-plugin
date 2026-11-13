/**
 * Stale "Run Gating Tests" check titles when a protected base branch advances.
 * Used by on-base-push.yml and by pool-entry / label-sync retest paths.
 */

/** Matches formatStaleGatingTitle() for any base ref (main or release-X.Y). */
const STALE_TITLE_PATTERN = /^Hot Cluster E2E: stale -- .+ has advanced since this ran$/;

export const formatStaleGatingTitle = (baseRef: string): string =>
  `Hot Cluster E2E: stale -- ${baseRef} has advanced since this ran`;

export const isStaleGatingTitle = (title: string | undefined | null): boolean =>
  Boolean(title) && STALE_TITLE_PATTERN.test(title!);
