/**
 * Validate the cluster_name input and output a single-element matrix.
 * Outputs `matrix=["<name>"]` to GITHUB_OUTPUT.
 *
 * Required env: INPUT_CLUSTER_NAME
 */

import { appendFileSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const CLUSTER_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,20}$/;

const main = async (): Promise<void> => {
  const clusterName = requireEnv('INPUT_CLUSTER_NAME');

  if (!CLUSTER_NAME_PATTERN.test(clusterName)) {
    throw new Error(
      `Invalid cluster_name: '${clusterName}'. Must match [a-zA-Z0-9][a-zA-Z0-9._-]* and be at most 21 characters.`,
    );
  }

  appendFileSync(process.env.GITHUB_OUTPUT!, `matrix=${JSON.stringify([clusterName])}\n`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
