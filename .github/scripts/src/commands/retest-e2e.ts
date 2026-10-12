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
import { enforceCommentTrust, reactToComment } from '../shared/command-helpers';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep, setOutput } from '../shared/output';
import type { CommandContext } from './command-registry';
import { buildRetestReport, reportRetestE2EError } from './retest-e2e-helpers';

const liftE2EHold = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<void> => {
  try {
    await octokit.issues.removeLabel({ issue_number: prNumber, name: 'e2e-hold', owner, repo });
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
};

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
      !(await enforceCommentTrust(octokit, owner, repo, commentId, author, trusted, '/retest-e2e'))
    ) {
      return;
    }

    const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });
    const headSha = pullRequest.head.sha;
    const baseRef = pullRequest.base.ref;

    console.log(
      `/retest-e2e requested by ${author} on PR #${prNumber} (HEAD: ${headSha}, base: ${baseRef})`,
    );

    const lookbackDate = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const runs = await octokit.paginate(octokit.actions.listWorkflowRuns, {
      created: `>=${lookbackDate}`,
      owner,
      per_page: 100,
      repo,
      workflow_id: 'hot-cluster-e2e.yml',
    });

    const candidates = runs.filter((run) => {
      if (run.event === 'workflow_dispatch') {
        return run.display_title?.includes(`@ PR#${prNumber} retest`);
      }
      const prMatch = run.pull_requests?.some((pull) => pull.number === prNumber);
      const shaMatch = run.head_sha === headSha;
      return prMatch ?? shaMatch;
    });

    const runningCandidate =
      candidates.find((candidate) => candidate.status !== 'completed') ?? null;

    if (runningCandidate) {
      console.warn(
        `Run ${runningCandidate.id} for PR #${prNumber} is still ${runningCandidate.status} -- cancelling it and dispatching a fresh run instead.`,
      );
    } else {
      console.log(
        `No in-progress Hot Cluster E2E run found for PR #${prNumber} (base: ${baseRef}) -- dispatching a fresh run.`,
      );
    }

    await reactToComment(octokit, owner, repo, commentId, 'rocket');

    await dispatchWorkflow(octokit, {
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

    console.log(`Fresh run dispatched for PR #${prNumber} (base_ref=${baseRef}).`);
    setOutput('dispatched', 'true');
    setOutput('was_running', runningCandidate ? 'true' : 'false');

    await liftE2EHold(octokit, owner, repo, prNumber);

    const body = buildRetestReport(owner, repo, !!runningCandidate);
    try {
      await octokit.issues.createComment({ body, issue_number: prNumber, owner, repo });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not comment: ${msg}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await reportRetestE2EError(octokit, owner, repo, prNumber, msg);
  }
};

export const executeRetestE2E = async (ctx: CommandContext): Promise<void> => {
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
