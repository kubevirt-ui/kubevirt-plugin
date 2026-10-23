/**
 * Durable record of which hot cluster a manual-console deploy targeted.
 * Posted on the PR after successful provisioning so cleanup/teardown can
 * recover an explicit override (or the resolved default) without trusting
 * run-name brackets, the PR's current base ref, or dispatch-time notices.
 */

/** HTML marker — machine-readable, ignored in GitHub's rendered comment. */
export const MANUAL_CONSOLE_CLUSTER_MARKER_PREFIX = '<!-- manual-console-target-cluster:';

export const MANUAL_CONSOLE_CLUSTER_MARKER_REGEX =
  /<!--\s*manual-console-target-cluster:\s*([^\s>]+)\s*-->/;

/** Logins that post deploy records (App bot + workflow GITHUB_TOKEN). */
export const MANUAL_CONSOLE_DEPLOY_BOT_LOGINS: ReadonlySet<string> = new Set([
  'kubevirt-plugin-bot[bot]',
  'github-actions[bot]',
]);

export const isManualConsoleDeployBot = (login: string | undefined): boolean =>
  Boolean(login && MANUAL_CONSOLE_DEPLOY_BOT_LOGINS.has(login));

/**
 * Cleanup selection: only the post-provision HTML marker counts.
 * Dispatch notices must not include this marker (or any other parseable
 * target) so a failed redeploy cannot override a prior successful record.
 */
export const clusterNameFromDeployRecordBody = (body: string): string | undefined => {
  const marker = MANUAL_CONSOLE_CLUSTER_MARKER_REGEX.exec(body);
  return marker?.[1]?.trim() || undefined;
};

/** Authoritative record after successful provisioning (includes cleanup marker). */
export const formatManualConsoleDeployRecord = (clusterName: string): string =>
  [
    `${MANUAL_CONSOLE_CLUSTER_MARKER_PREFIX}${clusterName} -->`,
    `Manual console target cluster: \`${clusterName}\` (recorded for /cleanup-manual-console).`,
  ].join('\n');

/**
 * Non-authoritative dispatch notice — no cleanup marker. Informational only;
 * cleanup must ignore this and use the post-provision record instead.
 */
export const formatManualConsoleDeployNotice = (
  clusterName: string,
  infraType: string,
): string =>
  [
    `🚀 Dispatched a manual console deploy for this PR (intended cluster \`${clusterName}\`, infrastructure \`${infraType}\`).`,
    '',
    "If that cluster isn't already up, it will be provisioned first, which can take a while -- check the Actions run for progress.",
    'Login credentials will be sent to Slack once the console is ready.',
    'The cleanup target is recorded on the PR only after provisioning succeeds.',
  ].join('\n');
