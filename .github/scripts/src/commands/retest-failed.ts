/**
 * /retest-failed command — re-run only the failed parts of CI.
 * Unlike /retest-e2e, this never forces a fresh run of passing checks
 * and never lifts a /hold-e2e hold.
 *
 * Entry point: npx tsx src/commands/retest-failed.ts
 *
 * Required env: BOT_TOKEN, GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER,
 *               COMMENT_ID, COMMENT_AUTHOR, TRUSTED
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { enforceCommentTrust, reactToComment } from '../shared/command-helpers';
import { dispatchWorkflow } from '../shared/dispatch';
import { E2E_HOLD_LABEL } from '../shared/merge-pool';
import { failStep, setOutput } from '../shared/output';
import type { CommandContext } from './command-registry';
import {
  describeResult,
  E2E_LINES,
  reportRetestFailedError,
  rerunFailedJobsSafe,
} from './retest-failed-helpers';

const main = async (): Promise<void> => {
  const botToken = process.env.BOT_TOKEN ?? requireEnv('GITHUB_TOKEN');
  const ambientToken = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const commentId = Number(requireEnv('COMMENT_ID'));
  const author = requireEnv('COMMENT_AUTHOR');
  const trusted = process.env.TRUSTED === 'true';

  const botOctokit = new Octokit({ auth: botToken });
  const ambientOctokit = new Octokit({ auth: ambientToken });

  try {
    if (
      !(await enforceCommentTrust(
        botOctokit,
        owner,
        repo,
        commentId,
        author,
        trusted,
        '/retest-failed',
      ))
    ) {
      return;
    }

    const { data: pullRequest } = await ambientOctokit.pulls.get({
      owner,
      pull_number: prNumber,
      repo,
    });
    const headSha = pullRequest.head.sha;
    const baseRef = pullRequest.base.ref;

    console.log(
      `/retest-failed requested by ${author} on PR #${prNumber} (HEAD: ${headSha}, base: ${baseRef})`,
    );
    await reactToComment(botOctokit, owner, repo, commentId, 'rocket');

    const isHeld = (pullRequest.labels ?? []).some((label) => label.name === E2E_HOLD_LABEL);
    const e2eAction: string = await (async (): Promise<string> => {
      if (isHeld) {
        console.log(
          `PR #${prNumber} is on hold via /hold-e2e -- not evaluating "Run Gating Tests" further.`,
        );
        return 'held';
      }
      const { data: existing } = await ambientOctokit.checks.listForRef({
        check_name: 'Run Gating Tests',
        owner,
        ref: headSha,
        repo,
      });
      const [latest] = [...existing.check_runs].sort(
        (a, b) => new Date(b.started_at ?? '').getTime() - new Date(a.started_at ?? '').getTime(),
      );

      if (latest && latest.status !== 'completed') {
        return 'skip_running';
      }
      if (latest?.conclusion === 'success') {
        return 'skip_passing';
      }
      return 'dispatch';
    })();

    const [ciResult, prValidation] = await Promise.all([
      rerunFailedJobsSafe(botOctokit, owner, repo, headSha, 'ci_checks.yml', 'CI'),
      rerunFailedJobsSafe(botOctokit, owner, repo, headSha, 'pr-validation.yml', 'PR Validation'),
    ]);

    if (e2eAction === 'dispatch') {
      await dispatchWorkflow(botOctokit, {
        inputs: {
          base_ref: baseRef,
          pr_number: String(prNumber),
          skip_pool_check: 'true',
        },
        owner,
        ref: 'main',
        repo,
        workflowId: 'hot-cluster-e2e.yml',
      });
      console.log(`Dispatched fresh Hot Cluster E2E for PR #${prNumber} (base_ref=${baseRef}).`);
    }

    const body = [
      '🔁 `/retest-failed` processed for this PR:',
      '',
      describeResult('CI', ciResult),
      describeResult('PR Validation', prValidation),
      E2E_LINES[e2eAction] ?? `- **Hot Cluster E2E**: ${e2eAction}`,
    ].join('\n');

    try {
      await botOctokit.issues.createComment({ body, issue_number: prNumber, owner, repo });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not comment: ${msg}`);
    }

    setOutput('ci_outcome', ciResult.outcome);
    setOutput('prv_outcome', prValidation.outcome);
    setOutput('e2e_action', e2eAction);

    const erroredLabels = [
      ciResult.outcome === 'error' && 'CI',
      prValidation.outcome === 'error' && 'PR Validation',
    ].filter(Boolean);
    if (erroredLabels.length > 0) {
      failStep(`Could not process: ${erroredLabels.join(', ')} -- see warnings above.`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await reportRetestFailedError(botOctokit, owner, repo, prNumber, msg);
  }
};

export const executeRetestFailed = async (ctx: CommandContext): Promise<void> => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN ?? '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.TRUSTED = 'true';
  await main();
};

if (require.main === module) {
  void main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
