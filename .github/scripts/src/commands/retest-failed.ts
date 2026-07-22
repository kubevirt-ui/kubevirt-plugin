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
import { reactToComment, enforceCommentTrust } from '../shared/command-helpers';
import { dispatchWorkflow } from '../shared/dispatch';
import { setOutput, failStep } from '../shared/output';
import { E2E_HOLD_LABEL } from '../shared/merge-pool';

type RerunResult = {
  outcome: 'rerun' | 'skip' | 'error';
  detail: string;
  url: string;
};

const rerunFailedJobs = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
  workflowId: string,
  label: string,
): Promise<RerunResult> => {
  const runs = await octokit.paginate(octokit.actions.listWorkflowRuns, {
    owner,
    repo,
    workflow_id: workflowId,
    head_sha: headSha,
    per_page: 100,
  });
  const [latest] = runs.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  if (!latest) {
    return { outcome: 'skip', detail: `no ${label} run found for this commit`, url: '' };
  }
  if (latest.status !== 'completed') {
    return { outcome: 'skip', detail: `${label} is still ${latest.status}`, url: latest.html_url };
  }
  if (latest.conclusion === 'cancelled') {
    return {
      outcome: 'skip',
      detail: `${label} was cancelled, not failed -- re-run it manually from the Actions tab`,
      url: latest.html_url,
    };
  }
  if (!['failure', 'timed_out'].includes(latest.conclusion ?? '')) {
    return {
      outcome: 'skip',
      detail: `${label} already ${latest.conclusion}`,
      url: latest.html_url,
    };
  }

  await octokit.actions.reRunWorkflowFailedJobs({ owner, repo, run_id: latest.id });
  return { outcome: 'rerun', detail: '', url: latest.html_url };
};

const rerunFailedJobsSafe = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
  workflowId: string,
  label: string,
): Promise<RerunResult> => {
  try {
    return await rerunFailedJobs(octokit, owner, repo, headSha, workflowId, label);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not process ${label} at ${headSha}: ${msg}`);
    return { outcome: 'error', detail: msg, url: '' };
  }
};

const describeResult = (name: string, r: RerunResult): string => {
  if (r.outcome === 'rerun') {
    return `- **${name}**: re-running failed jobs${r.url ? ` ([latest run](${r.url}))` : ''}.`;
  }
  if (r.outcome === 'error') {
    return `- **${name}**: ⚠️ could not check -- ${r.detail}.`;
  }
  return `- **${name}**: skipped -- ${r.detail}${r.url ? ` ([latest run](${r.url}))` : ''}.`;
};

const E2E_LINES: Record<string, string> = {
  dispatch:
    '- **Hot Cluster E2E**: dispatching a fresh run -- `Run Gating Tests` was not currently passing for this commit.',
  held: '- **Hot Cluster E2E**: skipped -- this PR is on hold via `/hold-e2e`. `/retest-failed` never lifts a hold; comment `/retest-e2e` to lift it and get a fresh result.',
  skip_running: '- **Hot Cluster E2E**: skipped -- a run is already in progress for this commit.',
  skip_passing:
    '- **Hot Cluster E2E**: skipped -- `Run Gating Tests` already passed for this commit.',
};

const main = async (): Promise<void> => {
  const botToken = process.env.BOT_TOKEN || requireEnv('GITHUB_TOKEN');
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

    const { data: pr } = await ambientOctokit.pulls.get({ owner, repo, pull_number: prNumber });
    const headSha = pr.head.sha;
    const baseRef = pr.base.ref;

    console.log(
      `/retest-failed requested by ${author} on PR #${prNumber} (HEAD: ${headSha}, base: ${baseRef})`,
    );
    await reactToComment(botOctokit, owner, repo, commentId, 'rocket');

    // Determine E2E action
    let e2eAction: string;
    const isHeld = (pr.labels || []).some((l) => l.name === E2E_HOLD_LABEL);
    if (isHeld) {
      console.log(
        `PR #${prNumber} is on hold via /hold-e2e -- not evaluating "Run Gating Tests" further.`,
      );
      e2eAction = 'held';
    } else {
      const { data: existing } = await ambientOctokit.checks.listForRef({
        owner,
        repo,
        ref: headSha,
        check_name: 'Run Gating Tests',
      });
      const [latest] = existing.check_runs.sort(
        (a, b) => new Date(b.started_at ?? '').getTime() - new Date(a.started_at ?? '').getTime(),
      );

      if (latest && latest.status !== 'completed') {
        e2eAction = 'skip_running';
      } else if (latest && latest.conclusion === 'success') {
        e2eAction = 'skip_passing';
      } else {
        e2eAction = 'dispatch';
      }
    }

    // Re-run failed CI + PR Validation in parallel
    const [ci, prValidation] = await Promise.all([
      rerunFailedJobsSafe(botOctokit, owner, repo, headSha, 'ci_checks.yml', 'CI'),
      rerunFailedJobsSafe(botOctokit, owner, repo, headSha, 'pr_validation.yml', 'PR Validation'),
    ]);

    // Dispatch E2E if needed
    if (e2eAction === 'dispatch') {
      await dispatchWorkflow(botOctokit, {
        owner,
        repo,
        workflowId: 'hot-cluster-e2e.yml',
        ref: 'main',
        inputs: {
          pr_number: String(prNumber),
          base_ref: baseRef,
          skip_pool_check: 'true',
        },
      });
      console.log(`Dispatched fresh Hot Cluster E2E for PR #${prNumber} (base_ref=${baseRef}).`);
    }

    // Report
    const body = [
      '🔁 `/retest-failed` processed for this PR:',
      '',
      describeResult('CI', ci),
      describeResult('PR Validation', prValidation),
      E2E_LINES[e2eAction] ?? `- **Hot Cluster E2E**: ${e2eAction}`,
    ].join('\n');

    try {
      await botOctokit.issues.createComment({ owner, repo, issue_number: prNumber, body });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not comment: ${msg}`);
    }

    // Set outputs for downstream
    setOutput('ci_outcome', ci.outcome);
    setOutput('prv_outcome', prValidation.outcome);
    setOutput('e2e_action', e2eAction);

    const erroredLabels = [
      ci.outcome === 'error' && 'CI',
      prValidation.outcome === 'error' && 'PR Validation',
    ].filter(Boolean);
    if (erroredLabels.length > 0) {
      failStep(`Could not process: ${erroredLabels.join(', ')} -- see warnings above.`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setOutput('unexpected_error', 'true');
    setOutput('error_message', msg);

    try {
      await botOctokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: [
          '⚠️ `/retest-failed` hit an unexpected error and did not finish processing:',
          '',
          '```',
          msg,
          '```',
          '',
          'This usually means the `kubevirt-plugin-bot` GitHub App token is misconfigured — a maintainer should check it.',
        ].join('\n'),
      });
    } catch {
      /* best effort */
    }

    failStep(`Unexpected error: ${msg}`);
  }
};

import type { CommandContext } from './dispatcher';

export const executeRetestFailed = async (ctx: CommandContext): Promise<void> => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.TRUSTED = 'true';
  await main();
};

if (require.main === module) {
  main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
