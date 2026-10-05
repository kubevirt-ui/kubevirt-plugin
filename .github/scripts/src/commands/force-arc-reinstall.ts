/**
 * /force-arc-reinstall command — force a reinstall of the ARC GitHub
 * runner listener on this PR's cluster (even if its Kubernetes health
 * check reports Ready) and dispatch a fresh Hot Cluster E2E run.
 *
 * Use this when `Execute tests` stays `queued` with no runner ever
 * claiming it: the listener pod can be Ready in Kubernetes while GitHub
 * has no working registration for it. See ci-scripts/hot-cluster/arc/README.md.
 *
 * This affects the shared cluster for the PR's branch pool -- it may
 * transiently disrupt queued jobs for other PRs using the same cluster.
 *
 * Entry point: npx tsx src/commands/force-arc-reinstall.ts
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
import { enforceCommentTrust, reactToComment } from '../shared/command-helpers';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep, setOutput } from '../shared/output';
import type { CommandContext } from './command-registry';
import { findRunningE2ERun, liftE2EHold } from './e2e-dispatch-helpers';
import {
  buildForceArcReinstallReport,
  reportForceArcReinstallError,
} from './force-arc-reinstall-helpers';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN ?? requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const commentId = Number(requireEnv('COMMENT_ID'));
  const author = requireEnv('COMMENT_AUTHOR');
  const trusted = process.env.TRUSTED === 'true';
  const octokit = new Octokit({ auth: token });

  try {
    if (
      !(await enforceCommentTrust(
        octokit,
        owner,
        repo,
        commentId,
        author,
        trusted,
        '/force-arc-reinstall',
      ))
    ) {
      return;
    }

    const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });
    const headSha = pullRequest.head.sha;
    const baseRef = pullRequest.base.ref;

    console.log(
      `/force-arc-reinstall requested by ${author} on PR #${prNumber} (HEAD: ${headSha}, base: ${baseRef})`,
    );

    const runningCandidate = await findRunningE2ERun(octokit, owner, repo, prNumber, headSha);

    if (runningCandidate) {
      console.warn(
        `Run ${runningCandidate.id} for PR #${prNumber} is still ${runningCandidate.status} -- cancelling it and dispatching a fresh run with a forced ARC reinstall instead.`,
      );
    } else {
      console.log(
        `No in-progress Hot Cluster E2E run found for PR #${prNumber} (base: ${baseRef}) -- dispatching a fresh run with a forced ARC reinstall.`,
      );
    }

    await reactToComment(octokit, owner, repo, commentId, 'rocket');

    await dispatchWorkflow(octokit, {
      inputs: {
        base_ref: baseRef,
        force_arc_reinstall: 'true',
        pr_number: String(prNumber),
        skip_pool_check: 'true',
      },
      owner,
      ref: 'main',
      repo,
      workflowId: 'hot-cluster-e2e.yml',
    });

    console.log(
      `Fresh run dispatched for PR #${prNumber} (base_ref=${baseRef}) with force_arc_reinstall=true.`,
    );
    setOutput('dispatched', 'true');
    setOutput('was_running', runningCandidate ? 'true' : 'false');

    await liftE2EHold(octokit, owner, repo, prNumber);

    const body = buildForceArcReinstallReport(owner, repo, !!runningCandidate);
    try {
      await octokit.issues.createComment({ body, issue_number: prNumber, owner, repo });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not comment: ${msg}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await reportForceArcReinstallError(octokit, owner, repo, prNumber, msg);
  }
};

export const executeForceArcReinstall = async (ctx: CommandContext): Promise<void> => {
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
