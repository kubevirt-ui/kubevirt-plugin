/**
 * Parse /deploy-manual-console and /cleanup-manual-console from a PR comment.
 * Requires command boundaries so near-miss names (e.g. /deploy-manual-console-extra)
 * do not match as a prefix of a longer token.
 */

/** `/deploy-manual-console` or `/deploy-manual-console <cluster>` with boundaries.
 * Cluster args must be on the same line (horizontal whitespace only) so a
 * token on the next line is not captured as the cluster name. */
export const DEPLOY_CMD_REGEX =
  /(?:^|\s)\/deploy-manual-console(?:[ \t]+(\S+))?(?=\s|$)/;

/** `/cleanup-manual-console` or `/cleanup-manual-console <cluster>` with boundaries.
 * Same same-line cluster-arg rule as DEPLOY_CMD_REGEX. */
export const CLEANUP_CMD_REGEX =
  /(?:^|\s)\/cleanup-manual-console(?:[ \t]+(\S+))?(?=\s|$)/;

export type ManualConsoleCommandMatch = {
  clusterName: string;
};

export const parseDeployManualConsoleCommand = (
  commentBody: string,
): ManualConsoleCommandMatch | null => {
  const match = DEPLOY_CMD_REGEX.exec(commentBody);
  if (!match) {
    return null;
  }
  return { clusterName: match[1] ?? '' };
};

export const parseCleanupManualConsoleCommand = (
  commentBody: string,
): ManualConsoleCommandMatch | null => {
  const match = CLEANUP_CMD_REGEX.exec(commentBody);
  if (!match) {
    return null;
  }
  return { clusterName: match[1] ?? '' };
};
