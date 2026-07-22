/**
 * Check CI workflow activity for a specific cluster.
 * Shared by auto-teardown (check_ci step) and cleanup-all (busy check).
 */

import { Octokit } from '@octokit/rest';

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
const resolveClusterFromTitle = (title: string): string | null => {
  const bracketed = title.match(/^Hot Cluster E2E \[([^\]]+)\]/);
  if (!bracketed) return null;
  const token = bracketed[1];
  if (token.startsWith('kubevirt-plugin-')) return token;
  const release = token.match(/^release-(\d+)\.(\d+)$/);
  return release ? `kubevirt-plugin-${release[1]}${release[2]}` : 'kubevirt-plugin-ci';
};

const runMatchesCluster = (
  run: { display_title?: string | null },
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
  lastRunTime: string;
  inProgress: number;
  queued: number;
};

/** Check whether any CI workflows are active for a cluster, and find the last completed run time. */
export const checkCIActivity = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  clusterName: string,
  workflows: string[] = DEFAULT_WORKFLOWS,
): Promise<CIActivityResult> => {
  let inProgress = 0;
  let queued = 0;
  let lastRunTime: Date | null = null;

  const lookbackDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  for (const workflow of workflows) {
    for (const status of ['in_progress', 'queued', 'completed'] as const) {
      const params: Record<string, unknown> = {
        owner,
        repo,
        workflow_id: workflow,
        status,
        per_page: 100,
      };
      if (status === 'completed') {
        params.created = `>=${lookbackDate}`;
      }

      const runs = await octokit.paginate(
        octokit.actions.listWorkflowRuns,
        params as Parameters<typeof octokit.actions.listWorkflowRuns>[0],
      );

      const matching = runs.filter((r) => runMatchesCluster(r, workflow, clusterName));

      if (status === 'in_progress') inProgress += matching.length;
      if (status === 'queued') queued += matching.length;
      if (status === 'completed') {
        for (const run of matching) {
          const t = new Date(run.updated_at);
          if (!lastRunTime || t > lastRunTime) lastRunTime = t;
        }
      }
    }
  }

  return {
    activeJobs: inProgress > 0 || queued > 0,
    lastRunTime: lastRunTime ? lastRunTime.toISOString() : '',
    inProgress,
    queued,
  };
};

/** Simple check whether any tagged workflows are active (used by teardown/cleanup safety checks). */
export const hasActiveWorkflows = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  workflows: string[] = DEFAULT_WORKFLOWS,
): Promise<number> => {
  let active = 0;
  for (const wf of workflows) {
    const { data } = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: wf,
      status: 'in_progress',
      per_page: 1,
    });
    active += data.total_count;
  }
  return active;
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
          repo,
          workflow_id: workflow,
          status,
          per_page: 100,
        });
        if (runs.some((r) => r.display_title?.includes(tag))) {
          busy.add(clusterName);
        }
      }
    }
  }

  return [...busy];
};
