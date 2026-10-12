/**
 * Download IPI install state artifact from a GitHub Actions run.
 * If no run ID is provided, searches for the latest successful setup run
 * matching the cluster name.
 *
 * Required env: CLUSTER_NAME, GH_TOKEN
 * Optional env: SETUP_RUN_ID, GITHUB_REPOSITORY, RUNNER_TEMP
 */

import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

import { requireEnv } from '../kube-client';
import { setOutput } from '../utils';

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const repo = requireEnv('GITHUB_REPOSITORY');
  const runnerTemp = process.env.RUNNER_TEMP ?? '/tmp';
  const setupRunId = await (async (): Promise<string> => {
    const provided = process.env.SETUP_RUN_ID ?? '';
    if (provided) {
      return provided;
    }

    console.log(
      `No setup run ID provided. Looking up latest successful setup run for cluster '${clusterName}'...`,
    );

    try {
      const output = execSync(
        `gh run list --repo "${repo}" ` +
          '--workflow="IBM Cloud Hot Cluster Setup" --status=success --limit=20 ' +
          '--json databaseId,displayTitle',
        { encoding: 'utf8' },
      );

      const runs = JSON.parse(output) as Array<{ databaseId: number; displayTitle: string }>;
      const match = runs.find((run) => run.displayTitle.includes(`[${clusterName}]`));
      return match ? String(match.databaseId) : '';
    } catch {
      return '';
    }
  })();

  const installDir = `${runnerTemp}/ipi-install`;
  mkdirSync(installDir, { recursive: true });

  if (!setupRunId) {
    console.log(
      `::warning::No successful IPI setup run found for cluster '${clusterName}' and no ipi_setup_run_id provided. ` +
        'openshift-install destroy will be skipped; the VPC-resource sweep step will still run.',
    );
    process.exit(1);
  }

  console.log(`Using latest successful setup run for '${clusterName}': ${setupRunId}`);

  console.log(`Downloading IPI install state from run ${setupRunId}...`);
  execSync(
    `gh run download "${setupRunId}" --repo "${repo}" ` +
      `--name "ipi-install-state-${setupRunId}" ` +
      `--dir "${installDir}"`,
    { stdio: 'inherit' },
  );

  console.log('Downloaded files:');
  execSync(`ls -la "${installDir}/"`, { stdio: 'inherit' });

  setOutput('install_dir', installDir);
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
