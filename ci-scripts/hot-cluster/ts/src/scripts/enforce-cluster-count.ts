/**
 * Compare actual vs expected cluster count and fail if they differ.
 *
 * Required env: CLUSTER_NAME, EXPECTED_COUNT, ACTUAL_COUNT, MATCHED_CLUSTERS
 */

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const expected = requireEnv('EXPECTED_COUNT');
  const actual = requireEnv('ACTUAL_COUNT');
  const matched = process.env.MATCHED_CLUSTERS ?? '[]';

  if (actual !== expected) {
    console.error(
      `::error::cluster_name '${clusterName}' matches ${actual} distinct cluster(s): ${matched} — but expected_cluster_count=${expected}.`,
    );
    console.error(
      `::error::Narrow cluster_name to target one cluster precisely, or set expected_cluster_count=${actual} to confirm you intend to sweep all of them.`,
    );
    process.exit(1);
  }

  console.log(
    `Confirmed: cluster_name matches exactly ${actual} distinct cluster(s), as expected.`,
  );
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
