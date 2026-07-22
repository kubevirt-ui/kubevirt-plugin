/**
 * Validate the CLUSTER_NAME environment variable as a prefix filter.
 * Must match: starts with a lower-case letter or digit, followed by only
 * lower-case letters, digits, and hyphens. No length cap (it's a prefix
 * filter, not a single cluster's literal name).
 *
 * Required env: CLUSTER_NAME
 */

import { requireEnv } from '../kube-client';

const PREFIX_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');

  if (!PREFIX_PATTERN.test(clusterName)) {
    throw new Error(
      `Invalid cluster_name: '${clusterName}'. Must start with a lower-case letter/digit and contain only lower-case letters, digits, and hyphens (matches real cluster naming). No length cap here since it's used as a prefix filter, not a single cluster's literal name.`,
    );
  }

  console.log(`Cluster name prefix '${clusterName}' is valid`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
