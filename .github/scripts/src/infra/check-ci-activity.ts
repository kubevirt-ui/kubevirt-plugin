/**
 * Check CI workflow activity for a specific cluster.
 * Shared by auto-teardown (check_ci step) and cleanup-all (busy check).
 */

import { type Octokit } from '@octokit/rest';

const DEFAULT_WORKFLOWS = [
  '.github/workflows/hot-cluster-e2e.yml',
  '.github/workflows/hot-cluster-e2e-run.yml',
  '.github/workflows/ibmc-cluster-setup.yml',
];

/**
 * Resolve a display_title bracket token to a cluster name.
 * hot-cluster-e2e.yml's run-name can contain either an already-resolved
 * cluster name or a raw base branch like "release-4.20".
 */
const resolveClusterFromTitle = (title: string): null | string => {
  const bracketed = /^Hot Cluster E2E \[([^\]]+)\]/.exec(title);
  if (!bracketed) {
    return null;
  }
  const token = bracketed[1];
  if (token.startsWith('kubevirt-plugin-')) {
    return token;
  }
  const release = token.match(/^release-(\d+)\.(\d+)$/);
  return release ? `kubevirt-plugin-${release[1]}${release[2]}` : 'kubevirt-plugin-ci';
};

const runMatchesCluster = (
  run: { display_title?: null | string },
  workflow: string,
  clusterName: string,
): boolean => {
  const title = run.display_title ?? '';
  if (workflow === '.github/workflows/hot-cluster-e2e.yml') {
    return resolveClusterFromTitle(title) === clusterName;
  }
  return title.includes(`[${clusterName}]`);
};

export type CIActivityResult = {
  activeJobs: boolean;
  inProgress: number;
  lastRunTime: string;
  queued: number;
};

type StatusQuery = 'completed' | 'in_progress' | 'queued';

const collectWorkflowStatus = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  workflow: string,
  status: StatusQuery,
  clusterName: string,
  lookbackDate: string,
): Promise<{ completedTimes: Date[]; inProgress: number; queued: number }> => {
  const params: Record<string, unknown> = {
    owner,
    per_page: 100,
    repo,
    status,
    workflow_id: workflow,
  };
  if (status === 'completed') {
    params.created = `>=${lookbackDate}`;
  }

  const runs = await octokit.paginate(
    octokit.actions.listWorkflowRuns,
    params as Parameters<typeof octokit.actions.listWorkflowRuns>[0],
  );

  const matching = runs.filter((run) => runMatchesCluster(run, workflow, clusterName));

  return {
    completedTimes: status === 'completed' ? matching.map((run) => new Date(run.updated_at)) : [],
    inProgress: status === 'in_progress' ? matching.length : 0,
    queued: status === 'queued' ? matching.length : 0,
  };
};

/** Check whether any CI workflows are active for a cluster, and find the last completed run time. */
export const checkCIActivity = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  clusterName: string,
  workflows: string[] = DEFAULT_WORKFLOWS,
): Promise<CIActivityResult> => {
  const counts = { inProgress: 0, queued: 0 };
  const completedTimes: Date[] = [];
  const lookbackDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  for (const workflow of workflows) {
    for (const status of ['in_progress', 'queued', 'completed'] as const) {
      const result = await collectWorkflowStatus(
        octokit,
        owner,
        repo,
        workflow,
        status,
        clusterName,
        lookbackDate,
      );
      counts.inProgress += result.inProgress;
      counts.queued += result.queued;
      completedTimes.push(...result.completedTimes);
    }
  }

  const lastRunTime =
    completedTimes.length > 0
      ? completedTimes.reduce((latest, t) => (t > latest ? t : latest), completedTimes[0])
      : null;

  return {
    activeJobs: counts.inProgress > 0 || counts.queued > 0,
    inProgress: counts.inProgress,
    lastRunTime: lastRunTime ? lastRunTime.toISOString() : '',
    queued: counts.queued,
  };
};

/** Simple check whether any tagged workflows are active (used by teardown/cleanup safety checks). */
export const hasActiveWorkflows = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  workflows: string[] = DEFAULT_WORKFLOWS,
): Promise<number> => {
  const totals = await Promise.all(
    workflows.map(async (workflow) => {
      const { data } = await octokit.actions.listWorkflowRuns({
        owner,
        per_page: 1,
        repo,
        status: 'in_progress',
        workflow_id: workflow,
      });
      return data.total_count;
    }),
  );
  return totals.reduce((sum, count) => sum + count, 0);
};

/** Check if any of the matched clusters have active CI jobs (used by cleanup-all). */
export const checkBusyClusters = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  clusterNames: string[],
  workflows: string[] = DEFAULT_WORKFLOWS,
): Promise<string[]> => {
  const busy = new Set<string>();

  for (const clusterName of clusterNames) {
    const tag = `[${clusterName}]`;
    for (const workflow of workflows) {
      for (const status of ['in_progress', 'queued'] as const) {
        const runs = await octokit.paginate(octokit.actions.listWorkflowRuns, {
          owner,
          per_page: 100,
          repo,
          status,
          workflow_id: workflow,
        });
        if (runs.some((run) => run.display_title?.includes(tag))) {
          busy.add(clusterName);
        }
      }
    }
  }

  return [...busy];
};
