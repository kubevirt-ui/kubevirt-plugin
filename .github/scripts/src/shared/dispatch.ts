import { type Octokit } from '@octokit/rest';

type DispatchParams = {
  inputs?: Record<string, string>;
  owner: string;
  ref: string;
  repo: string;
  workflowId: string;
};

export type DispatchResult = {
  runId?: number;
  runUrl?: string;
};

const POLL_ATTEMPTS = 6;
const POLL_DELAY_MS = 2000;

/** Dispatch a workflow_dispatch event. */
export const dispatchWorkflow = async (octokit: Octokit, params: DispatchParams): Promise<void> => {
  await octokit.actions.createWorkflowDispatch({
    inputs: params.inputs,
    owner: params.owner,
    ref: params.ref,
    repo: params.repo,
    workflow_id: params.workflowId,
  });
};

/**
 * Dispatch a workflow and poll briefly for the resulting run ID/URL.
 * Best-effort: returns an empty result if the run isn't found within the
 * polling window (the dispatch itself already succeeded).
 */
export const dispatchWorkflowAndResolveRun = async (
  octokit: Octokit,
  params: DispatchParams,
): Promise<DispatchResult> => {
  const before = new Date().toISOString();
  await dispatchWorkflow(octokit, params);

  for (let i = 0; i < POLL_ATTEMPTS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
    const { data } = await octokit.actions.listWorkflowRuns({
      created: `>=${before}`,
      event: 'workflow_dispatch',
      owner: params.owner,
      per_page: 5,
      repo: params.repo,
      workflow_id: params.workflowId,
    });
    if (data.workflow_runs.length > 0) {
      const run = data.workflow_runs[0];
      return { runId: run.id, runUrl: run.html_url };
    }
  }

  console.warn('Could not resolve dispatched run ID within polling window.');
  return {};
};
