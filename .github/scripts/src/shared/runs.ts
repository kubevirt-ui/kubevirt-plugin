import { Octokit } from '@octokit/rest';

type WorkflowRunInfo = {
  id: number;
  status: string | null;
  conclusion: string | null;
  head_sha: string;
  created_at: string;
};

/** List in-progress workflow runs for a given workflow. */
export const listActiveRuns = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  workflowId: string | number,
  status: 'queued' | 'in_progress' = 'in_progress',
): Promise<WorkflowRunInfo[]> => {
  const { data } = await octokit.actions.listWorkflowRuns({
    owner,
    repo,
    workflow_id: workflowId,
    status,
    per_page: 100,
  });

  return data.workflow_runs.map((run) => ({
    id: run.id,
    status: run.status,
    conclusion: run.conclusion,
    head_sha: run.head_sha,
    created_at: run.created_at,
  }));
};

/** Cancel a workflow run. No-op if already completed. */
export const cancelRun = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  runId: number,
): Promise<void> => {
  try {
    await octokit.actions.cancelWorkflowRun({ owner, repo, run_id: runId });
  } catch (err) {
    if ((err as { status?: number }).status === 409) return;
    throw err;
  }
};

/** Re-run only the failed jobs of a workflow run. */
export const reRunFailedJobs = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  runId: number,
): Promise<void> => {
  await octokit.actions.reRunWorkflowFailedJobs({ owner, repo, run_id: runId });
};
