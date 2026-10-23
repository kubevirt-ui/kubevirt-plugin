/**
 * Dispatch deploy-manual-console.yml for a PR.
 * Resolves infra type (falls back to 'vpc', matching deploy-manual-console.yml
 * and hot-cluster-e2e defaults) and dispatches the workflow.
 *
 * OpenShift / CNV versions are not set here -- deploy-manual-console.yml
 * runs the same resolve-cluster-config action as hot-cluster-e2e.yml
 * (/retest-e2e), using the PR base ref passed as "branch".
 *
 * Cluster name is optional on `/deploy-manual-console [cluster]`. When
 * omitted, defaults to the E2E hot cluster for the PR base
 * (release-X.Y → kubevirt-plugin-XY, else kubevirt-plugin-ci).
 *
 * Entry point: npx tsx src/commands/deploy-manual-console-dispatch.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY,
 *               PR_NUMBER, BASE_REF
 * Optional env: CLUSTER_NAME, INFRA_TYPE, DETECT_OUTCOME, COMMENT_AUTHOR
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { reactToComment } from '../shared/command-helpers';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep, setOutput, warnStep } from '../shared/output';

import { formatManualConsoleDeployNotice } from './manual-console-cluster-record';
import { parseDeployManualConsoleCommand } from './parse-manual-console-command';
import { resolveClusterNameInput } from './resolve-default-cluster-name';

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
  const clusterName = resolveClusterNameInput(process.env.CLUSTER_NAME, baseRef);
  const detectOutcome = process.env.DETECT_OUTCOME ?? '';
  const octokit = new Octokit({ auth: token });

  const infraType = resolveDeployInfraType(process.env.INFRA_TYPE, detectOutcome);

  await dispatchWorkflow(octokit, {
    inputs: {
      // PR base ref — resolve-cluster-config in the workflow derives
      // openshift_version / cnv_channel / cnv_pin_version from this, same as
      // hot-cluster-e2e.yml does for /retest-e2e. Also used for the default
      // cluster_name when the input below is empty.
      branch: baseRef,
      // Pass the resolved name so Slack/react and runs-on see the real target
      // even when the comment omitted it.
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

  // Non-authoritative notice only — cleanup uses the post-provision marker
  // from record-target-cluster, not this dispatch comment.
  await octokit.issues.createComment({
    body: formatManualConsoleDeployNotice(clusterName, infraType),
    issue_number: Number(prNumber),
    owner,
    repo,
  });

  const commentId = Number(process.env.COMMENT_ID ?? '');
  if (Number.isInteger(commentId) && commentId > 0) {
    await reactToComment(octokit, owner, repo, commentId, 'rocket');
  }

  console.log(
    `Dispatched deploy-manual-console.yml for PR #${prNumber} ` +
      `(cluster=${clusterName}, infra=${infraType}, branch=${baseRef} for OC/CNV resolve).`,
  );
  setOutput('cluster_name', clusterName);
  setOutput('infra_type', infraType);
};

import type { CommandContext } from './dispatcher';

export const executeDeployConsole = async (ctx: CommandContext): Promise<void> => {
  const parsed = parseDeployManualConsoleCommand(ctx.commentBody);
  if (!parsed) {
    throw new Error(
      '`/deploy-manual-console` did not match. Use `/deploy-manual-console` ' +
        'or `/deploy-manual-console <cluster-name>`.',
    );
  }

  const { data: pullRequest } = await ctx.octokit.pulls.get({
    owner: ctx.owner,
    pull_number: ctx.prNumber,
    repo: ctx.repo,
  });

  process.env.BOT_TOKEN = process.env.BOT_TOKEN ?? '';
  process.env.GITHUB_TOKEN = process.env.BOT_TOKEN || process.env.GITHUB_TOKEN || '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.BASE_REF = pullRequest.base.ref;
  process.env.CLUSTER_NAME = parsed.clusterName;
  await main();
};

if (require.main === module) {
  void main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
