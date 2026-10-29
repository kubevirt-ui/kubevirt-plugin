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
 * hot-cluster-e2e.yml's run-name is
 * "Hot Cluster E2E [<test_project>] [cluster:<name>] @ ...".
 * The cluster: prefix is unambiguous (custom names like "main" / "release-test"
 * are not mistaken for legacy branch tokens). Legacy titles without the prefix
 * still parse: kubevirt-plugin-*, exact release-X.Y, raw "main", and malformed
 * release-* → kubevirt-plugin-ci.
 */
export const resolveClusterFromTitle = (title: string): null | string => {
  const bracketed = /^Hot Cluster E2E \[[^\]]*\] \[([^\]]+)\]/.exec(title);
  if (!bracketed) {
    return null;
  }
  const token = bracketed[1];

  const prefixed = /^cluster:(.+)$/.exec(token);
  if (prefixed) {
    return prefixed[1];
  }

  // Legacy titles (pre cluster: prefix).
  if (token.startsWith('kubevirt-plugin-')) {
    return token;
  }
  const release = /^release-(\d+)\.(\d+)$/.exec(token);
  if (release) {
    return `kubevirt-plugin-${release[1]}${release[2]}`;
  }
  if (token === 'main' || token.startsWith('release-')) {
    return 'kubevirt-plugin-ci';
  }
  return token;
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

/**
 * Count active setup/e2e workflows for a specific cluster (teardown safety).
 *
 * Filters by cluster the same way checkCIActivity does -- a queued E2E for
 * release-4.21 must not block teardown of kubevirt-plugin-415. Previously this
 * used unfiltered total_count and aborted teardown whenever *any* setup/e2e
 * run was queued or in progress repo-wide.
 *
 * Checks both 'in_progress' AND 'queued' -- a run whose last job hasn't
 * been picked up by a runner yet (e.g. because ARC itself is broken, or a
 * runner-capacity backlog) has top-level status 'queued', not
 * 'in_progress'. Checking only 'in_progress' previously let a real,
 * waiting-for-a-runner backlog slip past this exact safety check and
 * allowed a teardown to proceed.
 */
export const hasActiveWorkflows = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  clusterName: string,
  workflows: string[] = DEFAULT_WORKFLOWS,
): Promise<number> => {
  // lookback is unused for in_progress/queued queries
  const lookbackDate = new Date(0).toISOString();
  let total = 0;

  for (const workflow of workflows) {
    for (const status of ['in_progress', 'queued'] as const) {
      const result = await collectWorkflowStatus(
        octokit,
        owner,
        repo,
        workflow,
        status,
        clusterName,
        lookbackDate,
      );
      total += result.inProgress + result.queued;
    }
  }

  return total;
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
    for (const workflow of workflows) {
      for (const status of ['in_progress', 'queued'] as const) {
        const runs = await octokit.paginate(octokit.actions.listWorkflowRuns, {
          owner,
          per_page: 100,
          repo,
          status,
          workflow_id: workflow,
        });
        // Use runMatchesCluster so hot-cluster-e2e titles with [cluster:name]
        // are recognized (plain `[name]` substring matching misses that prefix).
        if (runs.some((run) => runMatchesCluster(run, workflow, clusterName))) {
          busy.add(clusterName);
        }
      }
    }
  }

  return [...busy];
};
