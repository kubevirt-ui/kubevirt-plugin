import type { Octokit } from '@octokit/rest';

/**
 * Close all check-runs for a given name/ref except the one we just published.
 * Older workflow runs can leave "in_progress" ghosts when a new run supersedes
 * them; this cleans those up so the PR doesn't show stale pending checks.
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
  const runs = await octokit.paginate(octokit.checks.listForRef, {
    check_name: checkName,
    owner,
    per_page: 100,
    ref,
    repo,
  });

  const orphans = runs.filter((run) => run.id !== keepCheckRunId && run.status !== 'completed');

  for (const orphan of orphans) {
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
      console.log(`Closed orphaned check-run ${orphan.id}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not close orphaned check-run ${orphan.id}: ${msg}`);
    }
  }
};
