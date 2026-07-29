/**
 * ok-to-test gate — dispatches hot-cluster-e2e.yml when ok-to-test label is added.
 * Entry point: npx tsx src/commands/ok-to-test-dispatch.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, BASE_REF
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = requireEnv('PR_NUMBER');
  const baseRef = requireEnv('BASE_REF');
  const octokit = new Octokit({ auth: token });

  await dispatchWorkflow(octokit, {
    inputs: {
      base_ref: baseRef,
      pr_number: prNumber,
      skip_pool_check: 'true',
    },
    owner,
    ref: 'main',
    repo,
    workflowId: 'hot-cluster-e2e.yml',
  });

  console.log(`Dispatched hot-cluster-e2e.yml for PR #${prNumber} (base: ${baseRef})`);
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
