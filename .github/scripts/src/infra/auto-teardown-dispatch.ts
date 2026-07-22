/**
 * Auto-teardown: dispatch the teardown workflow for a cluster.
 * Entry point: npx tsx src/infra/auto-teardown-dispatch.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_REF,
 *               CLUSTER_NAME, INFRA_TYPE
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext, getRef } from '../shared/actions-context';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const clusterName = requireEnv('CLUSTER_NAME');
  const infraType = process.env.INFRA_TYPE || 'classic';
  const ref = getRef();
  const octokit = new Octokit({ auth: token });

  console.log(`Triggering teardown for ${infraType} cluster '${clusterName}'`);

  await dispatchWorkflow(octokit, {
    owner,
    repo,
    workflowId: 'ibmc-cluster-teardown.yml',
    ref,
    inputs: {
      cluster_name: clusterName,
      infrastructure_type: infraType,
    },
  });
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
