import { type Octokit } from '@octokit/rest';

export { closeOrphanedCheckRuns } from './close-orphaned-checks';

type CheckRunOutput = {
  summary: string;
  title: string;
};

type CreateCheckRunParams = {
  conclusion?: string;
  detailsUrl?: string;
  headSha: string;
  name: string;
  owner: string;
  repo: string;
  status: 'completed' | 'in_progress' | 'queued';
  summary: string;
  title: string;
};

type UpdateCheckRunParams = {
  checkRunId: number;
  conclusion?: string;
  detailsUrl?: string;
  owner: string;
  repo: string;
  status: 'completed' | 'in_progress' | 'queued';
  summary: string;
  title: string;
};

const buildPayload = (
  params: CreateCheckRunParams | UpdateCheckRunParams,
): Record<string, unknown> => {
  const output: CheckRunOutput = { summary: params.summary, title: params.title };

  const payload: Record<string, unknown> = {
    output,
    owner: params.owner,
    repo: params.repo,
    status: params.status,
  };

  if (params.status === 'completed') {
    payload.conclusion = params.conclusion;
    payload.completed_at = new Date().toISOString();
  }
  if (params.detailsUrl) {
    payload.details_url = params.detailsUrl;
  }

  return payload;
};

/** Create a new check-run and return its id. */
export const createCheckRun = async (
  octokit: Octokit,
  params: CreateCheckRunParams,
): Promise<number> => {
  const payload = buildPayload(params);
  const { data } = await octokit.checks.create({
    ...payload,
    head_sha: params.headSha,
    name: params.name,
  } as Parameters<Octokit['checks']['create']>[0]);

  return data.id;
};

/** Update an existing check-run (same workflow run only) and return its id. */
export const updateCheckRun = async (
  octokit: Octokit,
  params: UpdateCheckRunParams,
): Promise<number> => {
  const payload = buildPayload(params);
  const { data } = await octokit.checks.update({
    ...payload,
    check_run_id: params.checkRunId,
  } as Parameters<Octokit['checks']['update']>[0]);

  return data.id;
};

/** Create or update a check-run. If checkRunId is provided, updates; otherwise creates. */
export const publishCheckRun = async (
  octokit: Octokit,
  params: (CreateCheckRunParams | UpdateCheckRunParams) & { checkRunId?: number },
): Promise<number> => {
  if (params.checkRunId && params.checkRunId > 0) {
    return updateCheckRun(octokit, {
      ...params,
      checkRunId: params.checkRunId,
    } as UpdateCheckRunParams);
  }
  return createCheckRun(octokit, params as CreateCheckRunParams);
};

type CheckRunInfo = {
  conclusion: null | string;
  id: number;
  output: { summary: null | string; title: null | string };
  status: string;
};

/** List all check-runs for a given ref and check name. */
export const listCheckRunsForRef = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  checkName: string,
): Promise<CheckRunInfo[]> => {
  const runs = await octokit.paginate(octokit.checks.listForRef, {
    check_name: checkName,
    owner,
    per_page: 100,
    ref,
    repo,
  });

  return runs.map((run) => ({
    conclusion: run.conclusion,
    id: run.id,
    output: {
      summary: run.output?.summary ?? null,
      title: run.output?.title ?? null,
    },
    status: run.status,
  }));
};
