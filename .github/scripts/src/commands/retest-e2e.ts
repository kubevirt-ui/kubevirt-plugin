/**
 * /retest-e2e command — cancel existing runs, dispatch fresh E2E, lift hold.
 * Entry point: npx tsx src/commands/retest-e2e.ts
 *
 * Required env: BOT_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, COMMENT_ID,
 *               COMMENT_AUTHOR, TRUSTED
 *
 * Outputs (via GITHUB_OUTPUT):
 *   dispatched, was_running, unexpected_error, error_message,
 *   was_held, removal_failed
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { reactToComment, enforceCommentTrust } from '../shared/command-helpers';
import { dispatchWorkflow } from '../shared/dispatch';
import { removeLabel } from '../github-comments';
import { setOutput, failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN || requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const commentId = Number(requireEnv('COMMENT_ID'));
  const author = requireEnv('COMMENT_AUTHOR');
  const trusted = process.env.TRUSTED === 'true';
  const octokit = new Octokit({ auth: token });

  try {
    if (!(await enforceCommentTrust(octokit, owner, repo, commentId, author, trusted, '/retest-e2e'))) {
      return;
    }

    const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
    const headSha = pr.head.sha;
    const baseRef = pr.base.ref;

    console.log(`/retest-e2e requested by ${author} on PR #${prNumber} (HEAD: ${headSha}, base: ${baseRef})`);

    const lookbackDate = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const runs = await octokit.paginate(octokit.actions.listWorkflowRuns, {
      owner,
      repo,
      workflow_id: 'hot-cluster-e2e.yml',
      created: `>=${lookbackDate}`,
      per_page: 100,
    });

    const candidates = runs.filter((r) => {
      if (r.event === 'workflow_dispatch') {
        return r.display_title?.includes(`@ PR#${prNumber} retest`);
      }
      const prMatch = r.pull_requests?.some((p) => p.number === prNumber);
      const shaMatch = r.head_sha === headSha;
      return prMatch || shaMatch;
    });

    const runningCandidate = candidates.find((c) => c.status !== 'completed') ?? null;

    if (runningCandidate) {
      console.warn(
        `Run ${runningCandidate.id} for PR #${prNumber} is still ${runningCandidate.status} -- cancelling it and dispatching a fresh run instead.`,
      );
    } else {
      console.log(`No in-progress Hot Cluster E2E run found for PR #${prNumber} (base: ${baseRef}) -- dispatching a fresh run.`);
    }

    await reactToComment(octokit, owner, repo, commentId, 'rocket');

    await dispatchWorkflow(octokit, {
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

    console.log(`Fresh run dispatched for PR #${prNumber} (base_ref=${baseRef}).`);
    setOutput('dispatched', 'true');
    setOutput('was_running', runningCandidate ? 'true' : 'false');

    // Lift /hold-e2e hold
    try {
      await octokit.issues.removeLabel({ owner, repo, issue_number: prNumber, name: 'e2e-hold' });
      console.log('Removed e2e-hold label -- /retest-e2e lifts any prior /hold-e2e.');
      setOutput('was_held', 'true');
    } catch (err) {
      if ((err as { status?: number }).status === 404) {
        setOutput('was_held', 'false');
      } else {
        setOutput('removal_failed', 'true');
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Could not remove e2e-hold label: ${msg}`);
      }
    }

    // Report dispatch
    const wasRunning = !!runningCandidate;
    const wasHeld = setOutput('was_held', '') === undefined; // already set above
    const reason = wasRunning
      ? 'A Hot Cluster E2E run was already in progress for this PR, so `/retest-e2e` cancelled it and dispatched a fresh one instead'
      : '`/retest-e2e` dispatched a fresh Hot Cluster E2E run for this PR, merged with the current base branch tip';

    const serverUrl = process.env.GITHUB_SERVER_URL ?? 'https://github.com';
    const body = [
      `🚀 ${reason} (this also re-provisions the cluster automatically if it was torn down).`,
      '',
      `See the [Actions tab](${serverUrl}/${owner}/${repo}/actions/workflows/hot-cluster-e2e.yml) for progress.`,
    ].join('\n');

    try {
      await octokit.issues.createComment({ owner, repo, issue_number: prNumber, body });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not comment: ${msg}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setOutput('unexpected_error', 'true');
    setOutput('error_message', msg);

    // Report error on PR
    try {
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: [
          '⚠️ `/retest-e2e` hit an unexpected error and did not re-run the Hot Cluster E2E workflow:',
          '',
          '```',
          msg,
          '```',
          '',
          'This usually means the `kubevirt-plugin-bot` GitHub App token (BOT_APP_ID / BOT_APP_PRIVATE_KEY) is misconfigured or the app was uninstalled — a maintainer should check it. ' +
            'In the meantime, re-run the failed workflow manually from the Actions tab.',
        ].join('\n'),
      });
    } catch {
      /* best effort */
    }

    failStep(`Unexpected error while processing /retest-e2e: ${msg}`);
  }
};

import type { CommandContext } from './dispatcher';

export const executeRetestE2E = async (ctx: CommandContext): Promise<void> => {
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
