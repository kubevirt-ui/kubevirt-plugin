/**
 * Shared helpers for commands that dispatch (or re-dispatch) a fresh
 * `hot-cluster-e2e.yml` run for a PR: finding an already-running run to
 * report as "superseded," and lifting any prior `/hold-e2e` hold.
 *
 * Used by /retest-e2e and /force-arc-reinstall.
 */

import type { Octokit } from '@octokit/rest';

import { setOutput } from '../shared/output';

export type RunningRun = {
  id: number;
  status: string | null;
};

/**
 * Find an in-progress (non-completed) `hot-cluster-e2e.yml` run for this PR
 * within the last 4 hours. Matches `workflow_dispatch` events (such as a
 * prior /retest-e2e or /force-arc-reinstall) via the `@ PR#<n> retest`
 * display-title marker, and all other events via `pull_requests`/`head_sha`.
 */
export const findRunningE2ERun = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  headSha: string,
): Promise<RunningRun | null> => {
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
    const prMatch = run.pull_requests?.some((pull) => pull.number === prNumber) ?? false;
    const shaMatch = run.head_sha === headSha;
    return prMatch || shaMatch;
  });

  const runningCandidate = candidates.find((candidate) => candidate.status !== 'completed');
  return runningCandidate ? { id: runningCandidate.id, status: runningCandidate.status } : null;
};

/**
 * Remove the `e2e-hold` label applied by /hold-e2e, if present. Sets the
 * `was_held` / `removal_failed` outputs for the caller's own reporting.
 */
export const liftE2EHold = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<void> => {
  try {
    await octokit.issues.removeLabel({ issue_number: prNumber, name: 'e2e-hold', owner, repo });
    console.log('Removed e2e-hold label -- lifting any prior /hold-e2e.');
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
