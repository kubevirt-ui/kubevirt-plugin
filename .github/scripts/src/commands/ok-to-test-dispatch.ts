/**
 * ok-to-test gate — dispatches hot-cluster-e2e.yml when ok-to-test label is added.
 * Entry point: npx tsx src/commands/ok-to-test-dispatch.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, BASE_REF
 * Outputs (via GITHUB_OUTPUT): run_url
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { dispatchWorkflowAndResolveRun } from '../shared/dispatch';
import { failStep, setOutput } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = requireEnv('PR_NUMBER');
  const baseRef = requireEnv('BASE_REF');
  const octokit = new Octokit({ auth: token });

  const result = await dispatchWorkflowAndResolveRun(octokit, {
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

  if (result.runUrl) {
    console.log(`Resolved run: ${result.runUrl}`);
    setOutput('run_url', result.runUrl);
  } else {
    setOutput('run_url', '');
  }
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
