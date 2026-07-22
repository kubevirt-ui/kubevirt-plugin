import { Octokit } from '@octokit/rest';

type DispatchParams = {
  owner: string;
  repo: string;
  workflowId: string;
  ref: string;
  inputs?: Record<string, string>;
};

/** Dispatch a workflow_dispatch event. */
export const dispatchWorkflow = async (octokit: Octokit, params: DispatchParams): Promise<void> => {
  await octokit.actions.createWorkflowDispatch({
    owner: params.owner,
    repo: params.repo,
    workflow_id: params.workflowId,
    ref: params.ref,
    inputs: params.inputs,
  });
};
