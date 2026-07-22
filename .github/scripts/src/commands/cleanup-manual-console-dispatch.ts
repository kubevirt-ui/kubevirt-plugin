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

const CLEANUP_CMD_REGEX = /\/cleanup-manual-console\s+(\S+)/;

export const executeCleanupConsole = async (ctx: CommandContext): Promise<void> => {
  const clusterMatch = ctx.commentBody.match(CLEANUP_CMD_REGEX);
  if (!clusterMatch) {
    throw new Error(
      '`/cleanup-manual-console` requires a cluster name, e.g. `/cleanup-manual-console my-cluster`.',
    );
  }

  const [{ data: pr }, { data: repoData }] = await Promise.all([
    ctx.octokit.pulls.get({ owner: ctx.owner, repo: ctx.repo, pull_number: ctx.prNumber }),
    ctx.octokit.repos.get({ owner: ctx.owner, repo: ctx.repo }),
  ]);

  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.BASE_REF = pr.base.ref;
  process.env.CLUSTER_NAME = clusterMatch[1];
  process.env.DEFAULT_BRANCH = repoData.default_branch;
  await main();
};

if (require.main === module) {
  main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
