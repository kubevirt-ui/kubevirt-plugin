/**
 * Dispatch deploy-manual-console.yml for a PR.
 * Resolves infra type (falls back to 'vpc', matching deploy-manual-console.yml
 * and hot-cluster-e2e defaults) and dispatches the workflow.
 *
 * OpenShift / CNV versions are not set here -- deploy-manual-console.yml
 * runs the same resolve-cluster-config action as hot-cluster-e2e.yml
 * (/retest-e2e), using the PR base ref passed as "branch".
 *
 * Entry point: npx tsx src/commands/deploy-manual-console-dispatch.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY,
 *               PR_NUMBER, BASE_REF, CLUSTER_NAME
 * Optional env: INFRA_TYPE, DETECT_OUTCOME, COMMENT_AUTHOR
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep, setOutput, warnStep } from '../shared/output';

/** Default when INFRA_TYPE is unset — must stay aligned with workflow defaults. */
export const DEFAULT_DEPLOY_INFRA_TYPE = 'vpc';

export const resolveDeployInfraType = (
  infraType: string | undefined,
  detectOutcome = '',
): string => {
  if (infraType) {
    return infraType;
  }
  if (detectOutcome === 'failure') {
    warnStep(
      `Cluster infra detection failed -- falling back to '${DEFAULT_DEPLOY_INFRA_TYPE}'.`,
    );
  }
  return DEFAULT_DEPLOY_INFRA_TYPE;
};

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = requireEnv('PR_NUMBER');
  const baseRef = requireEnv('BASE_REF');
  const clusterName = requireEnv('CLUSTER_NAME');
  const detectOutcome = process.env.DETECT_OUTCOME ?? '';
  const octokit = new Octokit({ auth: token });

  const infraType = resolveDeployInfraType(process.env.INFRA_TYPE, detectOutcome);

  await dispatchWorkflow(octokit, {
    inputs: {
      // PR base ref — resolve-cluster-config in the workflow derives
      // openshift_version / cnv_channel / cnv_pin_version from this, same as
      // hot-cluster-e2e.yml does for /retest-e2e.
      branch: baseRef,
      cluster_name: clusterName,
      infrastructure_type: infraType,
      pr_number: prNumber,
      // Comment author — resolve-trusted-pr checks this when GITHUB_ACTOR is the bot.
      triggered_by: process.env.COMMENT_AUTHOR ?? '',
    },
    owner,
    ref: 'main',
    repo,
    workflowId: 'deploy-manual-console.yml',
  });

  console.log(
    `Dispatched deploy-manual-console.yml for PR #${prNumber} ` +
      `(cluster=${clusterName}, infra=${infraType}, branch=${baseRef} for OC/CNV resolve).`,
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
