/**
 * Download IPI install state artifact from a GitHub Actions run.
 * If no run ID is provided, searches for the latest successful setup run
 * matching the cluster name.
 *
 * Required env: CLUSTER_NAME, GH_TOKEN
 * Optional env: SETUP_RUN_ID, GITHUB_REPOSITORY, RUNNER_TEMP
 */

import { execSync } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';

import { requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const repo = requireEnv('GITHUB_REPOSITORY');
  const runnerTemp = process.env.RUNNER_TEMP ?? '/tmp';
  let setupRunId = process.env.SETUP_RUN_ID ?? '';

  const installDir = `${runnerTemp}/ipi-install`;
  mkdirSync(installDir, { recursive: true });

  if (!setupRunId) {
    console.log(`No setup run ID provided. Looking up latest successful setup run for cluster '${clusterName}'...`);

    try {
      const output = execSync(
        `gh run list --repo "${repo}" ` +
          '--workflow="IBM Cloud Hot Cluster Setup" --status=success --limit=20 ' +
          '--json databaseId,displayTitle',
        { encoding: 'utf8' },
      );

      const runs = JSON.parse(output) as Array<{ databaseId: number; displayTitle: string }>;
      const match = runs.find((r) => r.displayTitle.includes(`[${clusterName}]`));
      setupRunId = match ? String(match.databaseId) : '';
    } catch {
      setupRunId = '';
    }

    if (!setupRunId) {
      console.log(
        `::warning::No successful IPI setup run found for cluster '${clusterName}' and no ipi_setup_run_id provided. ` +
          'openshift-install destroy will be skipped; the VPC-resource sweep step will still run.',
      );
      process.exit(1);
    }

    console.log(`Using latest successful setup run for '${clusterName}': ${setupRunId}`);
  }

  console.log(`Downloading IPI install state from run ${setupRunId}...`);
  execSync(
    `gh run download "${setupRunId}" --repo "${repo}" ` +
      `--name "ipi-install-state-${setupRunId}" ` +
      `--dir "${installDir}"`,
    { stdio: 'inherit' },
  );

  console.log('Downloaded files:');
  execSync(`ls -la "${installDir}/"`, { stdio: 'inherit' });

  appendFileSync(process.env.GITHUB_OUTPUT!, `install_dir=${installDir}\n`);
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
