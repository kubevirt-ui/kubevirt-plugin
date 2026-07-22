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
import { setOutput, failStep, warnStep } from '../shared/output';

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
  const infraType = process.env.INFRA_TYPE || 'ipi';

  await dispatchWorkflow(octokit, {
    owner,
    repo,
    workflowId: 'deploy-manual-console.yml',
    ref: 'main',
    inputs: {
      pr_number: prNumber,
      branch: baseRef,
      cluster_name: clusterName,
      infrastructure_type: infraType,
      openshift_version: process.env.OPENSHIFT_VERSION ?? '',
      cnv_channel: process.env.CNV_CHANNEL ?? '',
      cnv_pin_version: process.env.CNV_PIN_VERSION ?? '',
    },
  });

  console.log(`Dispatched deploy-manual-console.yml for PR #${prNumber} (cluster=${clusterName}, infra=${infraType}).`);
  setOutput('cluster_name', clusterName);
  setOutput('infra_type', infraType);
};

import type { CommandContext } from './dispatcher';

export const executeDeployConsole = async (ctx: CommandContext): Promise<void> => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  await main();
};

if (require.main === module) {
  main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
