import type { Octokit } from '@octokit/rest';

import { failStep, setOutput } from '../shared/output';

export type RerunResult = {
  outcome: 'error' | 'no_failed_jobs' | 'no_run_found' | 'rerun_triggered';
};

/** Attempt to re-run failed jobs for a workflow. Returns the outcome. */
export const rerunFailedJobsSafe = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
  workflowFileName: string,
  label: string,
): Promise<RerunResult> => {
  try {
    const runs = await octokit.paginate(octokit.actions.listWorkflowRuns, {
      head_sha: headSha,
      owner,
      per_page: 10,
      repo,
      workflow_id: workflowFileName,
    });

    const latest = runs
      .filter((run) => run.status === 'completed')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (!latest) {
      console.log(`${label}: no completed run found for HEAD ${headSha}.`);
      return { outcome: 'no_run_found' };
    }

    if (latest.conclusion === 'success') {
      console.log(`${label}: latest run ${latest.id} already passed -- nothing to re-run.`);
      return { outcome: 'no_failed_jobs' };
    }

    await octokit.actions.reRunWorkflowFailedJobs({
      owner,
      repo,
      run_id: latest.id,
    });
    console.log(`${label}: re-ran failed jobs for run ${latest.id}.`);
    return { outcome: 'rerun_triggered' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`${label}: could not re-run failed jobs: ${msg}`);
    return { outcome: 'error' };
  }
};

/** Human-readable description for a rerun result. */
export const describeResult = (label: string, result: RerunResult): string => {
  switch (result.outcome) {
    case 'rerun_triggered':
      return `- **${label}**: Re-ran failed jobs.`;
    case 'no_failed_jobs':
      return `- **${label}**: Already passing -- nothing to re-run.`;
    case 'no_run_found':
      return `- **${label}**: No completed run found for this commit.`;
    case 'error':
      return `- **${label}**: ⚠️ Could not re-run failed jobs (see logs).`;
    default: {
      const _exhaustive: never = result.outcome;
      return `- **${label}**: ${String(_exhaustive)}`;
    }
  }
};

/** Comment-body lines for the E2E action outcome. */
export const E2E_LINES: Record<string, string> = {
  dispatch: '- **Hot Cluster E2E**: Dispatched fresh run (check was not passing).',
  held: '- **Hot Cluster E2E**: Skipped — PR is on hold via `/hold-e2e`.',
  skip_passing: '- **Hot Cluster E2E**: Already passing — no action taken.',
  skip_running: '- **Hot Cluster E2E**: Already running — no action taken.',
};

/** Report an unexpected error for /retest-failed. */
export const reportRetestFailedError = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  message: string,
): Promise<void> => {
  setOutput('unexpected_error', 'true');
  setOutput('error_message', message);

  try {
    await octokit.issues.createComment({
      body: `⚠️ \`/retest-failed\` hit an unexpected error:\n\n\`\`\`\n${message}\n\`\`\``,
      issue_number: prNumber,
      owner,
      repo,
    });
  } catch {
    /* best effort */
  }

  failStep(message);
};
