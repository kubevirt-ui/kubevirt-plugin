/**
 * /cancel-e2e command — detect in-progress E2E runs and report cancellation.
 * The actual cancellation happens via YAML concurrency groups (stays in YAML).
 * This script handles: trust check, run detection, reaction, and reporting.
 *
 * Entry point: npx tsx src/commands/cancel-e2e.ts
 *
 * Required env: BOT_TOKEN or GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER,
 *               COMMENT_ID, COMMENT_AUTHOR, TRUSTED, HEAD_SHA
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { enforceCommentTrust, reactToComment } from '../shared/command-helpers';
import { failStep, setOutput } from '../shared/output';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN ?? requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const commentId = Number(requireEnv('COMMENT_ID'));
  const author = requireEnv('COMMENT_AUTHOR');
  const trusted = process.env.TRUSTED === 'true';
  const octokit = new Octokit({ auth: token });

  if (
    !(await enforceCommentTrust(octokit, owner, repo, commentId, author, trusted, '/cancel-e2e'))
  ) {
    setOutput('was_running', 'false');
    setOutput('head_sha', '');
    return;
  }

  const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });
  const headSha = pullRequest.head.sha;
  console.log(`/cancel-e2e requested by ${author} on PR #${prNumber} (HEAD: ${headSha})`);

  const [inProgressRuns, queuedRuns] = await Promise.all([
    octokit.paginate(octokit.actions.listWorkflowRuns, {
      owner,
      per_page: 100,
      repo,
      status: 'in_progress' as const,
      workflow_id: 'hot-cluster-e2e.yml',
    }),
    octokit.paginate(octokit.actions.listWorkflowRuns, {
      owner,
      per_page: 100,
      repo,
      status: 'queued' as const,
      workflow_id: 'hot-cluster-e2e.yml',
    }),
  ]);

  const activeRuns = [...inProgressRuns, ...queuedRuns];

  const isIrrelevantLabelNoop = (run: { display_title?: null | string }): boolean =>
    run.display_title?.includes('(skipped: irrelevant label)') ?? false;

  const runningCandidates = activeRuns.filter((run) => {
    if (isIrrelevantLabelNoop(run)) {
      return false;
    }
    if (run.event === 'workflow_dispatch') {
      return run.display_title?.includes(`@ PR#${prNumber} retest`);
    }
    const prMatch = run.pull_requests?.some((pull) => pull.number === prNumber);
    const shaMatch = run.head_sha === headSha;
    return prMatch ?? shaMatch;
  });

  const wasRunning = runningCandidates.length > 0;

  console.log(
    wasRunning
      ? `Found ${runningCandidates.length} in-progress/queued run(s) for PR #${prNumber}: ${runningCandidates.map((run) => run.id).join(', ')}`
      : `No in-progress/queued Hot Cluster E2E run found for PR #${prNumber}.`,
  );

  await reactToComment(octokit, owner, repo, commentId, 'eyes');

  setOutput('was_running', wasRunning ? 'true' : 'false');
  setOutput('head_sha', headSha);
};

import type { CommandContext } from './dispatcher';

/** Called by the dispatcher when /cancel-e2e is matched. */
export const executeCancelE2E = async (ctx: CommandContext): Promise<void> => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN ?? '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.TRUSTED = 'true';
  await main();
};

// Standalone entry point
if (require.main === module) {
  void main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
