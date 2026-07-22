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
import { reactToComment, enforceCommentTrust } from '../shared/command-helpers';
import { setOutput, failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN || requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const commentId = Number(requireEnv('COMMENT_ID'));
  const author = requireEnv('COMMENT_AUTHOR');
  const trusted = process.env.TRUSTED === 'true';
  const octokit = new Octokit({ auth: token });

  if (!(await enforceCommentTrust(octokit, owner, repo, commentId, author, trusted, '/cancel-e2e'))) {
    setOutput('was_running', 'false');
    setOutput('head_sha', '');
    return;
  }

  const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
  const headSha = pr.head.sha;
  console.log(`/cancel-e2e requested by ${author} on PR #${prNumber} (HEAD: ${headSha})`);

  const [inProgressRuns, queuedRuns] = await Promise.all([
    octokit.paginate(octokit.actions.listWorkflowRuns, {
      owner,
      repo,
      workflow_id: 'hot-cluster-e2e.yml',
      status: 'in_progress' as const,
      per_page: 100,
    }),
    octokit.paginate(octokit.actions.listWorkflowRuns, {
      owner,
      repo,
      workflow_id: 'hot-cluster-e2e.yml',
      status: 'queued' as const,
      per_page: 100,
    }),
  ]);

  const activeRuns = [...inProgressRuns, ...queuedRuns];

  const isIrrelevantLabelNoop = (run: { display_title?: string | null }) =>
    run.display_title?.includes('(skipped: irrelevant label)');

  const runningCandidates = activeRuns.filter((r) => {
    if (isIrrelevantLabelNoop(r)) return false;
    if (r.event === 'workflow_dispatch') {
      return r.display_title?.includes(`@ PR#${prNumber} retest`);
    }
    const prMatch = r.pull_requests?.some((p) => p.number === prNumber);
    const shaMatch = r.head_sha === headSha;
    return prMatch || shaMatch;
  });

  const wasRunning = runningCandidates.length > 0;

  console.log(
    wasRunning
      ? `Found ${runningCandidates.length} in-progress/queued run(s) for PR #${prNumber}: ${runningCandidates.map((r) => r.id).join(', ')}`
      : `No in-progress/queued Hot Cluster E2E run found for PR #${prNumber}.`,
  );

  await reactToComment(octokit, owner, repo, commentId, 'eyes');

  setOutput('was_running', wasRunning ? 'true' : 'false');
  setOutput('head_sha', headSha);
};

import type { CommandContext } from './dispatcher';

/** Called by the dispatcher when /cancel-e2e is matched. */
export const executeCancelE2E = async (ctx: CommandContext): Promise<void> => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '';
  process.env.PR_NUMBER = String(ctx.prNumber);
  process.env.COMMENT_ID = String(ctx.commentId);
  process.env.COMMENT_AUTHOR = ctx.author;
  process.env.TRUSTED = 'true';
  await main();
};

// Standalone entry point
if (require.main === module) {
  main().catch((err) => failStep(err instanceof Error ? err.message : String(err)));
}
