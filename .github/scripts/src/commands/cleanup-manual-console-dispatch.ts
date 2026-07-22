/**
 * Dispatch deploy-manual-console.yml with action: teardown for a PR.
 *
 * Entry point: npx tsx src/commands/cleanup-manual-console-dispatch.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY,
 *               PR_NUMBER, BASE_REF, CLUSTER_NAME, DEFAULT_BRANCH
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { dispatchWorkflow } from '../shared/dispatch';
import { setOutput, failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = requireEnv('PR_NUMBER');
  const baseRef = requireEnv('BASE_REF');
  const clusterName = requireEnv('CLUSTER_NAME');
  const defaultBranch = requireEnv('DEFAULT_BRANCH');
  const octokit = new Octokit({ auth: token });

  await dispatchWorkflow(octokit, {
    owner,
    repo,
    workflowId: 'deploy-manual-console.yml',
    ref: defaultBranch,
    inputs: {
      action: 'teardown',
      pr_number: prNumber,
      branch: baseRef,
      cluster_name: clusterName,
    },
  });

  console.log(
    `Dispatched deploy-manual-console.yml teardown for PR #${prNumber} (cluster=${clusterName}).`,
  );
  setOutput('cluster_name', clusterName);
};

import type { CommandContext } from './dispatcher';

export const executeCleanupConsole = async (ctx: CommandContext): Promise<void> => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  await main();
};

if (require.main === module) {
  main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
