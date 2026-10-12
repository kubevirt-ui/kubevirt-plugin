/**
 * Dispatch deploy-manual-console.yml for a PR.
 * Resolves infra type (falls back to 'ipi') and dispatches the workflow.
 *
 * Entry point: npx tsx src/commands/deploy-manual-console-dispatch.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY,
 *               PR_NUMBER, BASE_REF, CLUSTER_NAME, INFRA_TYPE,
 *               DETECT_OUTCOME, OPENSHIFT_VERSION, CNV_CHANNEL, CNV_PIN_VERSION
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep, setOutput, warnStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = requireEnv('PR_NUMBER');
  const baseRef = requireEnv('BASE_REF');
  const clusterName = requireEnv('CLUSTER_NAME');
  const detectOutcome = process.env.DETECT_OUTCOME ?? '';
  const octokit = new Octokit({ auth: token });

  if (detectOutcome === 'failure') {
    warnStep(`Cluster infra detection for '${clusterName}' failed -- falling back to 'ipi'.`);
  }
  const infraType = process.env.INFRA_TYPE ?? 'ipi';

  await dispatchWorkflow(octokit, {
    inputs: {
      branch: baseRef,
      cluster_name: clusterName,
      cnv_channel: process.env.CNV_CHANNEL ?? '',
      cnv_pin_version: process.env.CNV_PIN_VERSION ?? '',
      infrastructure_type: infraType,
      openshift_version: process.env.OPENSHIFT_VERSION ?? '',
      pr_number: prNumber,
    },
    owner,
    ref: 'main',
    repo,
    workflowId: 'deploy-manual-console.yml',
  });

  console.log(
    `Dispatched deploy-manual-console.yml for PR #${prNumber} (cluster=${clusterName}, infra=${infraType}).`,
  );
  setOutput('cluster_name', clusterName);
  setOutput('infra_type', infraType);
};

import type { CommandContext } from './dispatcher';

const DEPLOY_CMD_REGEX = /\/deploy-manual-console\s+(\S+)/;

export const executeDeployConsole = async (ctx: CommandContext): Promise<void> => {
  const clusterMatch = DEPLOY_CMD_REGEX.exec(ctx.commentBody);
  if (!clusterMatch) {
    throw new Error(
      '`/deploy-manual-console` requires a cluster name, e.g. `/deploy-manual-console my-cluster`.',
    );
  }

  const { data: pullRequest } = await ctx.octokit.pulls.get({
    owner: ctx.owner,
    pull_number: ctx.prNumber,
    repo: ctx.repo,
  });

  process.env.BOT_TOKEN = process.env.BOT_TOKEN ?? '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.BASE_REF = pullRequest.base.ref;
  process.env.CLUSTER_NAME = clusterMatch[1];
  await main();
};

if (require.main === module) {
  void main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
