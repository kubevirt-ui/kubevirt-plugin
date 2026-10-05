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
 * Distinguishes "ARC is broken" (no *online* runner for this label ever
 * appears within the timeout) from "legitimately queued behind
 * MAX_RUNNERS capacity" (an online runner for this label exists, even if
 * currently busy with another job) -- only the former is cancelled.
 *
 * The self-hosted runners list is an admin-scoped API that the default
 * GITHUB_TOKEN cannot call (see check-runner-busy.ts); if the caller
 * couldn't mint that token, this is a no-op (fail open: never wrongly
 * cancel a legitimately-queued run just because we couldn't check).
 *
 * Required env: GH_TOKEN, GITHUB_REPOSITORY, RUN_ID, JOB_NAME, RUNNER_LABEL
 * Optional env: ARC_GH_TOKEN, PICKUP_TIMEOUT_MINUTES (default: 15),
 *               POLL_INTERVAL_SECONDS (default: 30)
 */

import { execSync } from 'node:child_process';

import { requireEnv, sleep } from '../kube-client';

type Job = { name: string; status: string };
type Runner = { labels?: Array<{ name: string }>; status: string };

const DEFAULT_PICKUP_TIMEOUT_MINUTES = 15;
const DEFAULT_POLL_INTERVAL_SECONDS = 30;

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

const hasOnlineRunner = (repo: string, label: string, token: string): boolean => {
  const data = JSON.parse(ghApi(`repos/${repo}/actions/runners?per_page=100`, token)) as {
    runners: Runner[];
  };
  return data.runners.some(
    (runner) =>
      runner.status === 'online' && runner.labels?.some((candidate) => candidate.name === label),
  );
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

const main = async (): Promise<void> => {
  const token = requireEnv('GH_TOKEN');
  const repo = requireEnv('GITHUB_REPOSITORY');
  const runId = requireEnv('RUN_ID');
  const jobName = requireEnv('JOB_NAME');
  const runnerLabel = requireEnv('RUNNER_LABEL');
  const arcToken = process.env.ARC_GH_TOKEN ?? '';
  const timeoutMinutes = positiveFiniteEnv(
    process.env.PICKUP_TIMEOUT_MINUTES,
    DEFAULT_PICKUP_TIMEOUT_MINUTES,
  );
  const pollIntervalMs =
    positiveFiniteEnv(process.env.POLL_INTERVAL_SECONDS, DEFAULT_POLL_INTERVAL_SECONDS) * 1000;

  if (!arcToken) {
    console.log(
      '::warning::ARC admin token unavailable -- cannot distinguish a broken listener from normal capacity queueing. Skipping watchdog (fail open).',
    );
    return;
  }

  const deadline = Date.now() + timeoutMinutes * 60 * 1000;
  console.log(
    `Watching job '${jobName}' on run ${runId}: waiting for an online '${runnerLabel}' runner (timeout: ${timeoutMinutes}m)...`,
  );

  while (Date.now() < deadline) {
    const status = getJobStatusSafe(repo, runId, jobName, token);
    if (status !== undefined && status !== 'queued') {
      console.log(`Job '${jobName}' is now '${status}'. Watchdog done.`);
      return;
    }

    const runnerOnline = hasOnlineRunnerSafe(repo, runnerLabel, arcToken);
    if (runnerOnline === true) {
      console.log(
        `An online '${runnerLabel}' runner exists -- ARC is healthy; job is legitimately queued behind capacity. Watchdog done.`,
      );
      return;
    }

    await sleep(Math.min(pollIntervalMs, Math.max(deadline - Date.now(), 0)));
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

  console.error(
    `::error::No online '${runnerLabel}' runner appeared within ${timeoutMinutes} minutes, and job '${jobName}' is still 'queued' -- ARC never claimed it. Cancelling run ${runId} so the required check does not hang forever.`,
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
