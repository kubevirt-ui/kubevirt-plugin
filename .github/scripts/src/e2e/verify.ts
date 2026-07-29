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
import { E2E_HOLD_LABEL } from '../shared/merge-pool';
import { failStep, setOutput } from '../shared/output';
import { mapResultDetails, type VerifyReason } from './result-mapper';
import {
  checkHoldState,
  closeOrphans,
  completeProgressStatus,
  publishGatingResult,
  syncE2ELabels,
} from './verify-helpers';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const botToken = process.env.BOT_TOKEN ?? token;
  const { owner, repo } = getRepoContext();
  const runUrl = getRunUrl();
  const prNumber = process.env.PR_NUMBER ?? '';
  const reason = (process.env.REASON ?? 'test-failed') as VerifyReason;
  const mainSha = process.env.MAIN_SHA ?? '';
  const isPoolRetest = process.env.IS_POOL_RETEST === 'true';
  const progressHeadSha = process.env.PROGRESS_HEAD_SHA ?? '';
  const progressStatusContext = process.env.PROGRESS_STATUS_CONTEXT ?? '';
  const prHeadSha = process.env.PR_HEAD_SHA ?? '';
  const gatingCheckRunId = Number(process.env.GATING_CHECK_RUN_ID ?? '0');
  const jobStatus = process.env.JOB_STATUS ?? '';
  const testFailureSummary = process.env.TEST_FAILURE_SUMMARY ?? '';

  const octokit = new Octokit({ auth: token });
  const botOctokit = new Octokit({ auth: botToken });

  await completeProgressStatus(
    octokit,
    owner,
    repo,
    progressHeadSha,
    progressStatusContext,
    jobStatus,
    runUrl,
  );

  if (!prNumber || !prHeadSha) {
    console.log('No PR context -- skipping check-run publishing (ad-hoc dispatch).');
    return;
  }

  const held = await checkHoldState(octokit, owner, repo, prNumber, E2E_HOLD_LABEL);

  const result = mapResultDetails({
    held,
    isPoolRetest,
    mainSha,
    prNumber,
    reason,
    testFailureSummary,
    workflowRunUrl: runUrl,
  });

  setOutput('conclusion', result.conclusion);
  setOutput('title', result.title);
  setOutput('summary', result.summary);

  const publishedCheckRunId = await publishGatingResult(
    botOctokit,
    owner,
    repo,
    prHeadSha,
    gatingCheckRunId,
    result,
    runUrl,
  );

  await syncE2ELabels(botOctokit, owner, repo, prNumber, result.conclusion);
  await closeOrphans(botOctokit, owner, repo, prHeadSha, publishedCheckRunId, runUrl);
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
