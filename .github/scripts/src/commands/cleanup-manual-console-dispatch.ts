/**
 * Dispatch deploy-manual-console.yml with action: teardown for a PR.
 *
 * Cluster name is optional on `/cleanup-manual-console [cluster]`. When
 * omitted, uses the newest deploy record on the PR (bot marker comment).
 * Does not infer from the PR's current base ref. If nothing is recorded,
 * the command fails and asks for an explicit cluster name.
 *
 * Entry point: npx tsx src/commands/cleanup-manual-console-dispatch.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY,
 *               PR_NUMBER, BASE_REF, DEFAULT_BRANCH
 * Optional env: CLUSTER_NAME
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { reactToComment } from '../shared/command-helpers';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep, setOutput } from '../shared/output';

import { parseCleanupManualConsoleCommand } from './parse-manual-console-command';
import {
  findRecordedManualConsoleCluster,
  resolveCleanupClusterName,
} from './resolve-cleanup-cluster-name';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = requireEnv('PR_NUMBER');
  const baseRef = requireEnv('BASE_REF');
  const defaultBranch = requireEnv('DEFAULT_BRANCH');
  const octokit = new Octokit({ auth: token });

  const clusterName = await resolveCleanupClusterName({
    explicitClusterName: process.env.CLUSTER_NAME,
    findRecorded: () =>
      findRecordedManualConsoleCluster(octokit, owner, repo, Number(prNumber)),
  });

  await dispatchWorkflow(octokit, {
    inputs: {
      action: 'teardown',
      branch: baseRef,
      cluster_name: clusterName,
      pr_number: prNumber,
    },
    owner,
    ref: defaultBranch,
    repo,
    workflowId: 'deploy-manual-console.yml',
  });

  const commentId = Number(process.env.COMMENT_ID ?? '');
  if (Number.isInteger(commentId) && commentId > 0) {
    await reactToComment(octokit, owner, repo, commentId, 'rocket');
    await octokit.issues.createComment({
      body: [
        `🧹 Dispatched a manual console teardown for this PR (cluster \`${clusterName}\`).`,
        '',
        'If no manual console exists for this PR, the teardown run is a harmless no-op -- check the Actions tab for progress.',
      ].join('\n'),
      issue_number: Number(prNumber),
      owner,
      repo,
    });
  }

  console.log(
    `Dispatched deploy-manual-console.yml teardown for PR #${prNumber} (cluster=${clusterName}).`,
  );
  setOutput('cluster_name', clusterName);
};

import type { CommandContext } from './dispatcher';

export const executeCleanupConsole = async (ctx: CommandContext): Promise<void> => {
  const parsed = parseCleanupManualConsoleCommand(ctx.commentBody);
  if (!parsed) {
    throw new Error(
      '`/cleanup-manual-console` did not match. Use `/cleanup-manual-console` ' +
        'or `/cleanup-manual-console <cluster-name>`.',
    );
  }

  const [{ data: pullRequest }, { data: repoData }] = await Promise.all([
    ctx.octokit.pulls.get({ owner: ctx.owner, pull_number: ctx.prNumber, repo: ctx.repo }),
    ctx.octokit.repos.get({ owner: ctx.owner, repo: ctx.repo }),
  ]);

  process.env.BOT_TOKEN = process.env.BOT_TOKEN ?? '';
  process.env.GITHUB_TOKEN = process.env.BOT_TOKEN || process.env.GITHUB_TOKEN || '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.BASE_REF = pullRequest.base.ref;
  process.env.CLUSTER_NAME = parsed.clusterName;
  process.env.DEFAULT_BRANCH = repoData.default_branch;
  await main();
};

if (require.main === module) {
  void main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
