/**
 * Matching helpers for ARC scale-set runners and peer Hot Cluster E2E runs.
 *
 * GitHub's self-hosted runners API sometimes returns ARC ephemeral runners
 * with an empty `labels` array even though the scale-set name is the
 * `runs-on` label. Runner names follow `{scaleSetName}-…-runner-…`, so we
 * fall back to a name-prefix match.
 */

export type GhRunner = {
  busy?: boolean;
  labels?: Array<{ name: string }>;
  name?: string;
  status?: string;
};

export type GhWorkflowJob = {
  name: string;
  status: string;
};

export type GhWorkflowRun = {
  display_title?: null | string;
  id: number;
};

export type ScaleSetRunnerSummary = {
  busy: number;
  online: number;
  total: number;
};

/**
 * True when the runner belongs to the given ARC scale set / runs-on label.
 * Populated labels are authoritative (exact scale-set label only -- no name
 * fallback). Name-prefix fallback applies only when labels are absent/empty,
 * and requires `${scaleSetName}-` so a shorter name cannot claim a longer
 * scale set's runners as a bare substring.
 */
export const runnerBelongsToScaleSet = (runner: GhRunner, scaleSetName: string): boolean => {
  const labels = runner.labels;
  if (labels !== undefined && labels.length > 0) {
    return labels.some((label) => label.name === scaleSetName);
  }
  const name = runner.name ?? '';
  return name.startsWith(`${scaleSetName}-`);
};

export const summarizeScaleSetRunners = (
  runners: GhRunner[],
  scaleSetName: string,
): ScaleSetRunnerSummary => {
  const matching = runners.filter((runner) => runnerBelongsToScaleSet(runner, scaleSetName));
  return {
    busy: matching.filter((runner) => runner.busy === true).length,
    online: matching.filter((runner) => runner.status === 'online').length,
    total: matching.length,
  };
};

export const hasOnlineScaleSetRunner = (runners: GhRunner[], scaleSetName: string): boolean =>
  runners.some(
    (runner) => runner.status === 'online' && runnerBelongsToScaleSet(runner, scaleSetName),
  );

/**
 * Resolve a Hot Cluster E2E display_title bracket token to a cluster name.
 * Parent run-name: "Hot Cluster E2E [<project>] [cluster:<name>] @ ...".
 * Mirrors `.github/scripts/src/infra/check-ci-activity.ts` (kept local to
 * avoid a cross-package import from ci-scripts).
 */
export const resolveClusterFromHotClusterE2ETitle = (title: string): null | string => {
  const bracketed = /^Hot Cluster E2E \[[^\]]*\] \[([^\]]+)\]/.exec(title);
  if (!bracketed) {
    return null;
  }
  const token = bracketed[1];

  const prefixed = /^cluster:(.+)$/.exec(token);
  if (prefixed) {
    return prefixed[1];
  }

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

/**
 * Resolve cluster identity from either parent Hot Cluster E2E titles or
 * standalone `hot-cluster-e2e-run.yml` titles:
 * "Hot Cluster E2E Run [<cluster_name>]".
 */
export const resolveClusterFromWorkflowTitle = (title: string): null | string => {
  const fromParent = resolveClusterFromHotClusterE2ETitle(title);
  if (fromParent) {
    return fromParent;
  }
  const standalone = /^Hot Cluster E2E Run \[([^\]]+)\]/.exec(title);
  return standalone?.[1] ?? null;
};

export const isExecuteTestsJobName = (jobName: string): boolean =>
  jobName === 'Execute tests' ||
  jobName === 'Execute tests (standalone dispatch)' ||
  jobName.endsWith('/ Execute tests') ||
  jobName.endsWith('/ Execute tests (standalone dispatch)');

/**
 * True when another Hot Cluster E2E run on the same cluster already has an
 * Execute-tests job in_progress -- evidence the scale set is healthy and
 * this run is only waiting on MAX_RUNNERS capacity.
 *
 * Peer matching uses `clusterName` (from workflow display_title), not the
 * `runs-on` runner label -- those can differ when runner_label is customized.
 */
export const hasPeerExecuteInProgress = (params: {
  clusterName: string;
  currentRunId: string;
  jobsByRunId: Record<string, GhWorkflowJob[]>;
  runs: GhWorkflowRun[];
}): boolean =>
  params.runs.some((run) => {
    if (String(run.id) === params.currentRunId) {
      return false;
    }
    if (resolveClusterFromWorkflowTitle(run.display_title ?? '') !== params.clusterName) {
      return false;
    }
    const jobs = params.jobsByRunId[String(run.id)] ?? [];
    return jobs.some(
      (job) => isExecuteTestsJobName(job.name) && job.status === 'in_progress',
    );
  });
