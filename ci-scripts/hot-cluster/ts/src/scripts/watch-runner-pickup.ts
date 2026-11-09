/**
 * Watchdog for ARC runner pickup.
 *
 * `runs-on: <self-hosted label>` jobs queue indefinitely if ARC never
 * registers an online runner for that label (e.g. the listener bounced
 * mid-queue -- see ibmc-cluster-setup.yml's ARC-reinstall skip logic).
 * GitHub's own job `timeout-minutes` does not start counting until a
 * runner claims the job, so this failure mode is otherwise silent -- see
 * https://github.com/kubevirt-ui/kubevirt-plugin/actions/runs/37301023503/job/111736216051.
 *
 * Distinguishes "ARC is broken" (no *online* runner for this scale set and
 * no peer Execute-tests job on the same cluster within the timeout) from
 * "legitimately queued behind MAX_RUNNERS capacity" (an online runner for
 * this scale set exists -- matched by label or ARC name prefix -- or a
 * peer E2E run is already executing on the same cluster) -- only the
 * former is cancelled. Capacity queue must not cancel.
 *
 * Online-runner checks key off RUNNER_LABEL (`runs-on`). Peer Execute
 * matching keys off CLUSTER_NAME (workflow display_title `cluster:…`),
 * which can differ when runner_label is customized.
 *
 * The self-hosted runners list is an admin-scoped API that the default
 * GITHUB_TOKEN cannot call (see check-runner-busy.ts); if the caller
 * couldn't mint that token, this is a no-op (fail open: never wrongly
 * cancel a legitimately-queued run just because we couldn't check).
 * Peer Execute activity uses the ambient GITHUB_TOKEN (no admin scope).
 *
 * Required env: GH_TOKEN, GITHUB_REPOSITORY, RUN_ID, JOB_NAME, RUNNER_LABEL
 * Optional env: CLUSTER_NAME (defaults to RUNNER_LABEL), ARC_GH_TOKEN,
 *               PICKUP_TIMEOUT_MINUTES (default: 15),
 *               POLL_INTERVAL_SECONDS (default: 30),
 *               CANCEL_GRACE_SECONDS (default: 120)
 */

import { execSync } from 'node:child_process';

import { requireEnv, sleep } from '../kube-client';
import {
  type GhRunner,
  type GhWorkflowJob,
  type GhWorkflowRun,
  hasOnlineScaleSetRunner,
  hasPeerExecuteInProgress,
  resolveClusterFromWorkflowTitle,
  summarizeScaleSetRunners,
} from '../runner-match';

type Job = { name: string; status: string };

const DEFAULT_PICKUP_TIMEOUT_MINUTES = 15;
const DEFAULT_POLL_INTERVAL_SECONDS = 30;
const DEFAULT_CANCEL_GRACE_SECONDS = 120;

const positiveFiniteEnv = (raw: string | undefined, fallback: number): number => {
  const parsed = Number(raw ?? String(fallback));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const ghApi = (path: string, token: string): string =>
  execSync(`gh api "${path}"`, { encoding: 'utf8', env: { ...process.env, GH_TOKEN: token } });

const getJobStatus = (
  repo: string,
  runId: string,
  jobName: string,
  token: string,
): string | undefined => {
  const data = JSON.parse(ghApi(`repos/${repo}/actions/runs/${runId}/jobs?per_page=100`, token)) as {
    jobs: Job[];
  };
  return data.jobs.find((job) => job.name === jobName)?.status;
};

const listRunners = (repo: string, token: string): GhRunner[] => {
  const data = JSON.parse(ghApi(`repos/${repo}/actions/runners?per_page=100`, token)) as {
    runners: GhRunner[];
  };
  return data.runners;
};

const hasOnlineRunner = (repo: string, label: string, token: string): boolean =>
  hasOnlineScaleSetRunner(listRunners(repo, token), label);

const logRunnerCapacity = (repo: string, label: string, token: string): void => {
  try {
    const summary = summarizeScaleSetRunners(listRunners(repo, token), label);
    console.log(
      `Scale set '${label}': ${summary.online} online / ${summary.busy} busy / ${summary.total} total matching runners.`,
    );
  } catch (err) {
    warnApiFailure('Failed to summarize runner capacity', err);
  }
};

const HOT_CLUSTER_WORKFLOWS = ['hot-cluster-e2e.yml', 'hot-cluster-e2e-run.yml'] as const;

/** All pages of in-progress runs from parent and standalone Hot Cluster E2E workflows. */
const listInProgressHotClusterRuns = (repo: string, token: string): GhWorkflowRun[] => {
  const byId = new Map<number, GhWorkflowRun>();
  for (const workflow of HOT_CLUSTER_WORKFLOWS) {
    const raw = execSync(
      `gh api --paginate "repos/${repo}/actions/workflows/${workflow}/runs?status=in_progress&per_page=100" --jq ".workflow_runs[]"`,
      { encoding: 'utf8', env: { ...process.env, GH_TOKEN: token } },
    ).trim();
    if (!raw) {
      continue;
    }
    for (const line of raw.split('\n')) {
      const run = JSON.parse(line) as GhWorkflowRun;
      byId.set(run.id, run);
    }
  }
  return [...byId.values()];
};

const listPeerExecuteJobs = (
  repo: string,
  runId: string,
  clusterName: string,
  token: string,
): boolean => {
  const workflowRuns = listInProgressHotClusterRuns(repo, token);

  // Fetch jobs only for same-cluster peers (title cluster identity, not
  // runner label) so a customized runs-on label cannot miss peer capacity.
  // Parent and standalone titles both resolve via resolveClusterFromWorkflowTitle.
  const peerRuns = workflowRuns.filter(
    (run) =>
      String(run.id) !== runId &&
      resolveClusterFromWorkflowTitle(run.display_title ?? '') === clusterName,
  );

  const jobsByRunId: Record<string, GhWorkflowJob[]> = {};
  for (const run of peerRuns) {
    const jobsData = JSON.parse(
      ghApi(`repos/${repo}/actions/runs/${run.id}/jobs?per_page=100`, token),
    ) as { jobs: GhWorkflowJob[] };
    jobsByRunId[String(run.id)] = jobsData.jobs;
  }

  return hasPeerExecuteInProgress({
    clusterName,
    currentRunId: runId,
    jobsByRunId,
    runs: peerRuns,
  });
};

const warnApiFailure = (label: string, err: unknown): void => {
  const msg = err instanceof Error ? err.message : String(err);
  console.log(`::warning::${label}: ${msg}`);
};

const getJobStatusSafe = (
  repo: string,
  runId: string,
  jobName: string,
  token: string,
): string | undefined => {
  try {
    return getJobStatus(repo, runId, jobName, token);
  } catch (err) {
    warnApiFailure('Failed to fetch job status', err);
    return undefined;
  }
};

const hasOnlineRunnerSafe = (
  repo: string,
  label: string,
  token: string,
): boolean | undefined => {
  try {
    return hasOnlineRunner(repo, label, token);
  } catch (err) {
    warnApiFailure('Failed to list self-hosted runners', err);
    return undefined;
  }
};

const hasPeerExecuteInProgressSafe = (
  repo: string,
  runId: string,
  clusterName: string,
  token: string,
): boolean | undefined => {
  try {
    return listPeerExecuteJobs(repo, runId, clusterName, token);
  } catch (err) {
    warnApiFailure('Failed to check peer Hot Cluster E2E activity', err);
    return undefined;
  }
};

type PollDeps = {
  arcToken: string;
  clusterName: string;
  jobName: string;
  repo: string;
  runId: string;
  runnerLabel: string;
  token: string;
};

// Polls until either a healthy signal is observed (job left 'queued', an
// online scale-set runner exists, or a peer Execute job is in_progress on
// the same cluster) or `untilMs` is reached.
// Shared by the main wait and the grace-confirmation window below, so
// "what counts as healthy" only has to be defined once.
const pollUntilHealthyOrDeadline = async (
  deps: PollDeps,
  untilMs: number,
  pollIntervalMs: number,
): Promise<boolean> => {
  const { arcToken, clusterName, jobName, repo, runId, runnerLabel, token } = deps;
  for (;;) {
    const status = getJobStatusSafe(repo, runId, jobName, token);
    if (status !== undefined && status !== 'queued') {
      console.log(`Job '${jobName}' is now '${status}'. Watchdog done.`);
      return true;
    }

    logRunnerCapacity(repo, runnerLabel, arcToken);

    const runnerOnline = hasOnlineRunnerSafe(repo, runnerLabel, arcToken);
    if (runnerOnline === true) {
      console.log(
        `An online '${runnerLabel}' runner exists -- ARC is healthy; job is legitimately queued behind capacity. Watchdog done.`,
      );
      return true;
    }

    const peerBusy = hasPeerExecuteInProgressSafe(repo, runId, clusterName, token);
    if (peerBusy === true) {
      console.log(
        `Peer Hot Cluster E2E Execute tests already in_progress on cluster '${clusterName}' -- ARC is healthy; job is legitimately queued behind capacity. Watchdog done.`,
      );
      return true;
    }

    const remainingMs = untilMs - Date.now();
    if (remainingMs <= 0) {
      return false;
    }
    console.log(
      `No healthy capacity signal yet for runner '${runnerLabel}' / cluster '${clusterName}' (job still queued). Waiting…`,
    );
    await sleep(Math.min(pollIntervalMs, remainingMs));
  }
};

const main = async (): Promise<void> => {
  const token = requireEnv('GH_TOKEN');
  const repo = requireEnv('GITHUB_REPOSITORY');
  const runId = requireEnv('RUN_ID');
  const jobName = requireEnv('JOB_NAME');
  const runnerLabel = requireEnv('RUNNER_LABEL');
  const clusterName = process.env.CLUSTER_NAME?.trim() || runnerLabel;
  const arcToken = process.env.ARC_GH_TOKEN ?? '';
  const timeoutMinutes = positiveFiniteEnv(
    process.env.PICKUP_TIMEOUT_MINUTES,
    DEFAULT_PICKUP_TIMEOUT_MINUTES,
  );
  const pollIntervalMs =
    positiveFiniteEnv(process.env.POLL_INTERVAL_SECONDS, DEFAULT_POLL_INTERVAL_SECONDS) * 1000;
  const graceSeconds = positiveFiniteEnv(
    process.env.CANCEL_GRACE_SECONDS,
    DEFAULT_CANCEL_GRACE_SECONDS,
  );

  if (!arcToken) {
    console.log(
      '::warning::ARC admin token unavailable -- cannot distinguish a broken listener from normal capacity queueing. Skipping watchdog (fail open).',
    );
    return;
  }

  const deps: PollDeps = { arcToken, clusterName, jobName, repo, runId, runnerLabel, token };
  const deadline = Date.now() + timeoutMinutes * 60 * 1000;
  console.log(
    `Watching job '${jobName}' on run ${runId}: waiting for an online '${runnerLabel}' runner or peer Execute on cluster '${clusterName}' (timeout: ${timeoutMinutes}m)...`,
  );

  if (await pollUntilHealthyOrDeadline(deps, deadline, pollIntervalMs)) {
    return;
  }

  // A single immediate check right at the deadline races a last-moment
  // pickup: a slow-but-not-broken ARC cold start (or plain read-after-
  // write lag on the jobs/runners list endpoints) can land an online
  // runner or an 'in_progress' job status just after the deadline was
  // checked, which previously meant a run that was about to succeed got
  // cancelled anyway -- see
  // https://github.com/kubevirt-ui/kubevirt-plugin/actions/runs/37472650615/job/112304407587.
  // Confirm over a short grace window instead of deciding off one snapshot.
  console.log(
    `No healthy signal within ${timeoutMinutes}m -- confirming over a ${graceSeconds}s grace window before cancelling, to rule out a last-moment pickup race.`,
  );
  if (await pollUntilHealthyOrDeadline(deps, Date.now() + graceSeconds * 1000, pollIntervalMs)) {
    return;
  }

  const finalStatus = getJobStatusSafe(repo, runId, jobName, token);
  if (finalStatus === undefined) {
    console.log(
      '::warning::Could not determine final job status after pickup timeout -- skipping cancel (fail open).',
    );
    return;
  }
  if (finalStatus !== 'queued') {
    console.log(`Job '${jobName}' is now '${finalStatus}'. Watchdog done.`);
    return;
  }

  const runnerOnlineBeforeCancel = hasOnlineRunnerSafe(repo, runnerLabel, arcToken);
  if (runnerOnlineBeforeCancel === true) {
    console.log(
      `An online '${runnerLabel}' runner is available -- skipping cancel despite pickup timeout.`,
    );
    return;
  }
  if (runnerOnlineBeforeCancel === undefined) {
    console.log(
      '::warning::Could not verify runner availability before cancel -- skipping cancel (fail open).',
    );
    return;
  }

  const peerBusyBeforeCancel = hasPeerExecuteInProgressSafe(repo, runId, clusterName, token);
  if (peerBusyBeforeCancel === true) {
    console.log(
      `Peer Execute tests still in_progress on cluster '${clusterName}' -- skipping cancel despite pickup timeout.`,
    );
    return;
  }
  if (peerBusyBeforeCancel === undefined) {
    console.log(
      '::warning::Could not verify peer Execute activity before cancel -- skipping cancel (fail open).',
    );
    return;
  }

  // Peer lookup can take long enough that Execute tests got claimed
  // mid-check; re-read status immediately before cancelling.
  const statusBeforeCancel = getJobStatusSafe(repo, runId, jobName, token);
  if (statusBeforeCancel === undefined) {
    console.log(
      '::warning::Could not reconfirm job status before cancel -- skipping cancel (fail open).',
    );
    return;
  }
  if (statusBeforeCancel !== 'queued') {
    console.log(`Job '${jobName}' is now '${statusBeforeCancel}'. Skipping cancel.`);
    return;
  }

  console.error(
    `::error::No online '${runnerLabel}' runner and no peer Execute activity on cluster '${clusterName}' within ${timeoutMinutes} minutes (confirmed again after a further ${graceSeconds}s grace window), and job '${jobName}' is still 'queued' -- ARC never claimed it. Cancelling run ${runId} so the required check does not hang forever.`,
  );

  try {
    execSync(`gh api -X POST "repos/${repo}/actions/runs/${runId}/cancel"`, {
      env: { ...process.env, GH_TOKEN: token },
      stdio: 'inherit',
    });
  } catch (err) {
    console.error(
      `::warning::Failed to cancel run ${runId}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  throw new Error(
    `No online '${runnerLabel}' runner appeared within ${timeoutMinutes} minutes -- ARC never claimed job '${jobName}'.`,
  );
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
