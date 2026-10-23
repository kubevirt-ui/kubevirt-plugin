/**
 * Post a durable target-cluster record on a PR (used by deploy-manual-console.yml
 * after resolve-config so UI dispatches are cleanup-discoverable).
 *
 * Entry point: npx tsx src/commands/record-manual-console-cluster.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, CLUSTER_NAME
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { failStep } from '../shared/output';

import { formatManualConsoleDeployRecord } from './manual-console-cluster-record';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const clusterName = requireEnv('CLUSTER_NAME').trim();
  if (!clusterName) {
    failStep('CLUSTER_NAME must be non-empty to record a manual-console target');
  }

  const octokit = new Octokit({ auth: token });
  await octokit.issues.createComment({
    body: formatManualConsoleDeployRecord(clusterName),
    issue_number: prNumber,
    owner,
    repo,
  });
  console.log(`Recorded manual-console target cluster '${clusterName}' on PR #${prNumber}.`);
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
