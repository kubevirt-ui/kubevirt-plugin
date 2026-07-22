/**
 * Find and delete offline self-hosted GitHub Actions runners for multiple
 * clusters matching a prefix. Falls back to the raw CLUSTER_NAME prefix
 * if detection found nothing.
 *
 * Required env: CLUSTER_NAME, GH_TOKEN, GITHUB_REPOSITORY
 * Optional env: MATCHED_CLUSTERS (JSON array of cluster names)
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
  const matchedRaw = process.env.MATCHED_CLUSTERS ?? '[]';

  console.log('=== Offline Self-Hosted Runners ===');

  let clusterNames: string[];
  try {
    const parsed: unknown = JSON.parse(matchedRaw);
    clusterNames = Array.isArray(parsed) && parsed.length > 0 ? (parsed as string[]) : [clusterName];
  } catch {
    clusterNames = [clusterName];
  }

  let allRunners: Runner[];
  try {
    const output = execSync(`gh api "/repos/${repo}/actions/runners"`, { encoding: 'utf8' });
    allRunners = (JSON.parse(output) as RunnersResponse).runners;
  } catch {
    console.log('Failed to list runners, skipping cleanup');
    return;
  }

  for (const name of clusterNames) {
    console.log(`Checking for offline self-hosted runners with label '${name}'...`);
    const offline = allRunners.filter(
      (r) => r.status === 'offline' && r.labels.some((l) => l.name === name),
    );

    if (offline.length === 0) {
      console.log(`  No offline '${name}' runners found`);
      continue;
    }

    for (const runner of offline) {
      console.log(`  Deleting offline runner ${runner.id} (label: ${name})...`);
      try {
        execSync(`gh api -X DELETE "/repos/${repo}/actions/runners/${runner.id}"`, {
          stdio: 'inherit',
        });
      } catch {
        console.log(`  Failed to delete runner ${runner.id}`);
      }
    }
  }
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
