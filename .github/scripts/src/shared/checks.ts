import { Octokit } from '@octokit/rest';

type CheckRunOutput = {
  title: string;
  summary: string;
};

type CreateCheckRunParams = {
  owner: string;
  repo: string;
  name: string;
  headSha: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: string;
  title: string;
  summary: string;
  detailsUrl?: string;
};

type UpdateCheckRunParams = {
  owner: string;
  repo: string;
  checkRunId: number;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: string;
  title: string;
  summary: string;
  detailsUrl?: string;
};

const buildPayload = (
  params: CreateCheckRunParams | UpdateCheckRunParams,
): Record<string, unknown> => {
  const output: CheckRunOutput = { title: params.title, summary: params.summary };

  const payload: Record<string, unknown> = {
    owner: params.owner,
    repo: params.repo,
    status: params.status,
    output,
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
    name: params.name,
    head_sha: params.headSha,
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
  id: number;
  status: string;
  conclusion: string | null;
  output: { title: string | null; summary: string | null };
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
    owner,
    repo,
    ref,
    check_name: checkName,
    per_page: 100,
  });

  return runs.map((run) => ({
    id: run.id,
    status: run.status,
    conclusion: run.conclusion,
    output: {
      title: run.output?.title ?? null,
      summary: run.output?.summary ?? null,
    },
  }));
};

/**
 * Close orphaned check-runs (stuck in non-completed state) that are older
 * than the given published check-run id. Returns the count of closed runs.
 */
export const closeOrphanedCheckRuns = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  checkName: string,
  publishedCheckRunId: number,
  detailsUrl: string,
): Promise<number> => {
  const runs = await listCheckRunsForRef(octokit, owner, repo, ref, checkName);

  const orphans = runs.filter((run) => run.status !== 'completed' && run.id < publishedCheckRunId);

  let closed = 0;
  for (const run of orphans) {
    try {
      await octokit.checks.update({
        owner,
        repo,
        check_run_id: run.id,
        status: 'completed',
        conclusion: 'neutral',
        completed_at: new Date().toISOString(),
        details_url: detailsUrl,
        output: {
          title: 'Hot Cluster E2E: superseded',
          summary: `This check-run was superseded by a newer "Run Gating Tests" result -- see ${detailsUrl}.`,
        },
      });
      closed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not close orphaned check-run ${run.id}: ${msg}`);
    }
  }

  return closed;
};
