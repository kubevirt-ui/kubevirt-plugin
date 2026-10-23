/**
 * Resolve cluster_name for deploy-manual-console.yml action=teardown.
 * Explicit input wins; otherwise recover the recorded deploy target.
 * Never derives from the PR base ref.
 *
 * Entry point: npx tsx src/commands/resolve-teardown-cluster-name.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY
 * Optional env: CLUSTER_NAME, PR_NUMBER (required when CLUSTER_NAME empty)
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { failStep, setOutput } from '../shared/output';

import {
  findRecordedManualConsoleCluster,
  resolveCleanupClusterName,
} from './resolve-cleanup-cluster-name';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const explicit = process.env.CLUSTER_NAME ?? '';
  const prNumberRaw = process.env.PR_NUMBER ?? '';

  const octokit = new Octokit({ auth: token });

  const clusterName = await resolveCleanupClusterName({
    explicitClusterName: explicit,
    findRecorded: async () => {
      if (!prNumberRaw.trim()) {
        return undefined;
      }
      const prNumber = Number(prNumberRaw);
      if (!Number.isInteger(prNumber) || prNumber <= 0) {
        return undefined;
      }
      return findRecordedManualConsoleCluster(octokit, owner, repo, prNumber);
    },
  });

  console.log(`Teardown cluster_name=${clusterName}`);
  setOutput('cluster_name', clusterName);
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
