import type { Octokit } from '@octokit/rest';

const WORKFLOW_RUN_URL_RE = /\/actions\/runs\/(\d+)(?:\/|$)/;

/** Extract a workflow run id from a check details_url / actions run URL. */
export const parseWorkflowRunIdFromUrl = (url: string | null | undefined): number | null => {
  if (!url) {
    return null;
  }
  const match = WORKFLOW_RUN_URL_RE.exec(url);
  if (!match) {
    return null;
  }
  const id = Number(match[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
};

const isWorkflowRunInactive = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  runId: number,
  cache: Map<number, boolean>,
): Promise<boolean> => {
  const cached = cache.get(runId);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const { data } = await octokit.actions.getWorkflowRun({
      owner,
      repo,
      run_id: runId,
    });
    // queued / waiting / in_progress must keep their check; only completed runs are safe to close.
    const inactive = data.status === 'completed';
    cache.set(runId, inactive);
    return inactive;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not resolve workflow run ${runId} for orphan check cleanup: ${msg}`);
    // Conservative: treat as active so we never cancel a live run's check.
    cache.set(runId, false);
    return false;
  }
};

/**
 * Close stale in-progress check-runs for a given name/ref, except the one we
 * just published. Older workflow runs can leave "in_progress" ghosts when a
 * new run supersedes them; this cleans those up so the PR doesn't show stale
 * pending checks.
 *
 * With concurrency queue:max, multiple Hot Cluster E2E runs can be active for
 * the same PR. Only close checks that belong to *older* workflow runs that are
 * confirmed inactive -- never cancel a newer (or still-active) run's check.
 */
export const closeOrphanedCheckRuns = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  checkName: string,
  keepCheckRunId: number,
  detailsUrl: string,
): Promise<void> => {
  const currentRunId = parseWorkflowRunIdFromUrl(detailsUrl);
  const inactiveCache = new Map<number, boolean>();

  const runs = await octokit.paginate(octokit.checks.listForRef, {
    check_name: checkName,
    owner,
    per_page: 100,
    ref,
    repo,
  });

  const candidates = runs.filter((run) => run.id !== keepCheckRunId && run.status !== 'completed');

  for (const orphan of candidates) {
    const orphanRunId = parseWorkflowRunIdFromUrl(orphan.details_url);

    if (orphanRunId === null) {
      console.log(`Skipping check-run ${orphan.id}: no workflow run id in details_url.`);
      continue;
    }

    // Belt-and-suspenders with keepCheckRunId for the current publish.
    if (currentRunId !== null && orphanRunId === currentRunId) {
      continue;
    }

    // Never close a newer run's check while cleaning up from an older finish.
    if (currentRunId !== null && orphanRunId > currentRunId) {
      console.log(
        `Skipping check-run ${orphan.id}: belongs to newer workflow run ${orphanRunId}.`,
      );
      continue;
    }

    const inactive = await isWorkflowRunInactive(octokit, owner, repo, orphanRunId, inactiveCache);
    if (!inactive) {
      console.log(
        `Skipping check-run ${orphan.id}: workflow run ${orphanRunId} is still active.`,
      );
      continue;
    }

    try {
      await octokit.checks.update({
        check_run_id: orphan.id,
        completed_at: new Date().toISOString(),
        conclusion: 'cancelled',
        details_url: detailsUrl,
        output: {
          summary: `Superseded by a newer workflow run. See [latest run](${detailsUrl}).`,
          title: `${checkName}: superseded`,
        },
        owner,
        repo,
        status: 'completed',
      });
      console.log(`Closed orphaned check-run ${orphan.id} (workflow run ${orphanRunId}).`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not close orphaned check-run ${orphan.id}: ${msg}`);
    }
  }
};
