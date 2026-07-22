/**
 * Find and delete offline self-hosted GitHub Actions runners matching CLUSTER_NAME.
 *
 * Required env: CLUSTER_NAME, GH_TOKEN, GITHUB_REPOSITORY
 */

import { execSync } from 'node:child_process';

import { requireEnv } from '../kube-client';

type Runner = {
  id: number;
  name: string;
  status: string;
  labels: Array<{ name: string }>;
};

type RunnersResponse = {
  runners: Runner[];
};

const main = async (): Promise<void> => {
  const clusterName = requireEnv('CLUSTER_NAME');
  const repo = requireEnv('GITHUB_REPOSITORY');

  console.log(`Checking for offline self-hosted runners with label '${clusterName}'...`);

  let runners: Runner[] = [];
  try {
    const output = execSync(`gh api "/repos/${repo}/actions/runners"`, { encoding: 'utf8' });
    const data = JSON.parse(output) as RunnersResponse;
    runners = data.runners.filter(
      (r) => r.status === 'offline' && r.labels.some((l) => l.name === clusterName),
    );
  } catch {
    console.log('Failed to list runners, skipping cleanup');
    return;
  }

  if (runners.length === 0) {
    console.log(`No offline '${clusterName}' runners found`);
    return;
  }

  for (const runner of runners) {
    console.log(`Deleting offline runner ${runner.id}...`);
    try {
      execSync(`gh api -X DELETE "/repos/${repo}/actions/runners/${runner.id}"`, {
        stdio: 'inherit',
      });
    } catch {
      console.log(`Failed to delete runner ${runner.id}`);
    }
  }

  console.log('Ghost runner cleanup complete');
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
