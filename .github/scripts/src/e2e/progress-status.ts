/**
 * Post a progress commit status for the hot-cluster-e2e pipeline.
 * Creates either a "pending" (cluster ready) or "failure" (cluster not ready)
 * commit status, and forwards head-sha / status-context when the cluster is ready.
 *
 * Entry point: npx tsx src/e2e/progress-status.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID,
 *               HEAD_SHA, STATUS_CONTEXT, CLUSTER_READY, EVENT_NAME
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext, getRunUrl } from '../shared/actions-context';
import { setOutput, failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const runUrl = getRunUrl();
  const headSha = requireEnv('HEAD_SHA');
  const statusContext = requireEnv('STATUS_CONTEXT');
  const clusterReady = process.env.CLUSTER_READY === 'true';
  const octokit = new Octokit({ auth: token });

  if (clusterReady) {
    setOutput('head-sha', headSha);
    setOutput('status-context', statusContext);
  }

  await octokit.repos.createCommitStatus({
    owner,
    repo,
    sha: headSha,
    context: statusContext,
    state: clusterReady ? 'pending' : 'failure',
    description: clusterReady
      ? 'Building plugin image'
      : 'Cluster not ready -- gating tests not run',
    target_url: runUrl,
  });
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
