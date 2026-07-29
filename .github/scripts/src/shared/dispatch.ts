import { type Octokit } from '@octokit/rest';

type DispatchParams = {
  inputs?: Record<string, string>;
  owner: string;
  ref: string;
  repo: string;
  workflowId: string;
};

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
