/**
 * E2E verify — the single entry point for hot-cluster-e2e.yml's
 * verify-gating-tests job. Replaces 6 inline JS steps:
 *   1. Complete progress status
 *   2. Check for active /hold-e2e hold
 *   3. Determine result details (via result-mapper.ts)
 *   4. Publish "Run Gating Tests" check-run
 *   5. Sync e2e-passed/e2e-failed labels
 *   6. Close orphaned check-runs
 *
 * Entry point: npx tsx src/e2e/verify.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID,
 *               PR_NUMBER, REASON, MAIN_SHA, IS_POOL_RETEST,
 *               PROGRESS_HEAD_SHA, PROGRESS_STATUS_CONTEXT,
 *               PR_HEAD_SHA, GATING_CHECK_RUN_ID, JOB_STATUS,
 *               TEST_FAILURE_SUMMARY, BOT_TOKEN (optional)
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext, getRunUrl } from '../shared/actions-context';
import { publishCheckRun, closeOrphanedCheckRuns } from '../shared/checks';
import { addLabel, removeLabel } from '../github-comments';
import { E2E_HOLD_LABEL, E2E_PASSED_LABEL, E2E_FAILED_LABEL } from '../shared/merge-pool';
import { setOutput, failStep, warnStep } from '../shared/output';
import { mapResultDetails, type VerifyReason } from './result-mapper';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const botToken = process.env.BOT_TOKEN || token;
  const { owner, repo } = getRepoContext();
  const runUrl = getRunUrl();
  const prNumber = process.env.PR_NUMBER ?? '';
  const reason = (process.env.REASON ?? 'test-failed') as VerifyReason;
  const mainSha = process.env.MAIN_SHA ?? '';
  const isPoolRetest = process.env.IS_POOL_RETEST === 'true';
  const progressHeadSha = process.env.PROGRESS_HEAD_SHA ?? '';
  const progressStatusContext = process.env.PROGRESS_STATUS_CONTEXT ?? '';
  const prHeadSha = process.env.PR_HEAD_SHA ?? '';
  const gatingCheckRunId = Number(process.env.GATING_CHECK_RUN_ID || '0');
  const jobStatus = process.env.JOB_STATUS ?? '';
  const testFailureSummary = process.env.TEST_FAILURE_SUMMARY ?? '';

  const octokit = new Octokit({ auth: token });
  const botOctokit = new Octokit({ auth: botToken });

  // 1. Complete progress status
  if (progressHeadSha && progressStatusContext) {
    try {
      const passed = jobStatus === 'success';
      await octokit.repos.createCommitStatus({
        owner,
        repo,
        sha: progressHeadSha,
        context: progressStatusContext,
        state: passed ? 'success' : 'failure',
        description: passed
          ? 'Hot cluster gating tests passed'
          : 'Hot cluster gating tests did not pass',
        target_url: runUrl,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      warnStep(`Could not complete progress status: ${msg}`);
    }
  }

  if (!prNumber || !prHeadSha) {
    console.log('No PR context -- skipping check-run publishing (ad-hoc dispatch).');
    return;
  }

  // 2. Check for active /hold-e2e hold
  let held = false;
  try {
    const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: Number(prNumber) });
    held = (pr.labels || []).some((l) => l.name === E2E_HOLD_LABEL);
    console.log(`PR #${prNumber} e2e-hold label present: ${held}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    warnStep(`Could not check hold state: ${msg}`);
  }

  // 3. Determine result details
  const result = mapResultDetails({
    reason,
    prNumber,
    mainSha,
    isPoolRetest,
    held,
    testFailureSummary,
    workflowRunUrl: runUrl,
  });

  setOutput('conclusion', result.conclusion);
  setOutput('title', result.title);
  setOutput('summary', result.summary);

  // 4. Publish "Run Gating Tests" check-run
  let publishedCheckRunId = 0;
  try {
    publishedCheckRunId = await publishCheckRun(octokit, {
      owner,
      repo,
      name: 'Run Gating Tests',
      headSha: prHeadSha,
      checkRunId: gatingCheckRunId > 0 ? gatingCheckRunId : undefined,
      status: 'completed',
      conclusion: result.conclusion,
      title: result.title,
      summary: result.summary,
      detailsUrl: runUrl,
    });
    setOutput('check_run_id', String(publishedCheckRunId));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    warnStep(`Could not publish gating check result: ${msg}`);
  }

  // 5. Sync e2e-passed/e2e-failed labels (only for real results, not held/neutral)
  if (result.conclusion === 'success' || result.conclusion === 'failure') {
    const toAdd = result.conclusion === 'success' ? E2E_PASSED_LABEL : E2E_FAILED_LABEL;
    const toRemove = result.conclusion === 'success' ? E2E_FAILED_LABEL : E2E_PASSED_LABEL;

    const labelMeta: Record<string, { color: string; description: string }> = {
      [E2E_PASSED_LABEL]: { color: '2ea44f', description: 'Hot Cluster E2E passed at the latest real result' },
      [E2E_FAILED_LABEL]: { color: 'd73a4a', description: 'Hot Cluster E2E failed at the latest real result' },
    };

    try {
      await addLabel(botOctokit, owner, repo, Number(prNumber), toAdd, labelMeta[toAdd]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      warnStep(`Could not add ${toAdd} label: ${msg}`);
    }

    try {
      await removeLabel(botOctokit, owner, repo, Number(prNumber), toRemove);
    } catch {
      /* 404 is expected */
    }
  }

  // 6. Close orphaned check-runs
  if (publishedCheckRunId > 0) {
    try {
      const closed = await closeOrphanedCheckRuns(
        octokit,
        owner,
        repo,
        prHeadSha,
        'Run Gating Tests',
        publishedCheckRunId,
        runUrl,
      );
      if (closed > 0) console.log(`Closed ${closed} orphaned "Run Gating Tests" check-run(s).`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      warnStep(`Could not close orphaned check-runs: ${msg}`);
    }
  }
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
