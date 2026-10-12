import type { Octokit } from '@octokit/rest';

import { addLabel, hasLabel, removeLabel, setCommitStatus } from '../github-comments';

import { closeOrphanedCheckRuns, publishCheckRun } from '../shared/checks';
import { E2E_FAILED_LABEL, E2E_PASSED_LABEL } from '../shared/merge-pool';
import type { ResultDetails } from './result-mapper';

const GATING_CHECK_NAME = 'Run Gating Tests';

/** Complete the "in progress" commit status that the early workflow step created. */
export const completeProgressStatus = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
  statusContext: string,
  jobStatus: string,
  _targetUrl: string,
): Promise<void> => {
  if (!headSha || !statusContext) {
    console.log('No progress status to complete (missing headSha or context).');
    return;
  }
  const state = jobStatus === 'success' ? 'success' : 'failure';
  try {
    await setCommitStatus(octokit, owner, repo, headSha, state, `E2E ${state}`, statusContext);
    console.log(`Completed progress status "${statusContext}" as ${state}.`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not complete progress status: ${msg}`);
  }
};

/** Check if the E2E hold label is present on the PR. */
export const checkHoldState = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: string,
  holdLabel: string,
): Promise<boolean> => {
  try {
    return await hasLabel(octokit, owner, repo, Number(prNumber), holdLabel);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not check hold label: ${msg}`);
    return false;
  }
};

/** Publish (create or update) the "Run Gating Tests" check-run. */
export const publishGatingResult = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
  existingCheckRunId: number,
  result: ResultDetails,
  detailsUrl: string,
): Promise<number> =>
  publishCheckRun(octokit, {
    checkRunId: existingCheckRunId > 0 ? existingCheckRunId : undefined,
    conclusion: result.conclusion,
    detailsUrl,
    headSha,
    name: GATING_CHECK_NAME,
    owner,
    repo,
    status: 'completed',
    summary: result.summary,
    title: result.title,
  });

/** Sync e2e-passed / e2e-failed labels based on check conclusion. */
export const syncE2ELabels = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: string,
  conclusion: string,
): Promise<void> => {
  const prNum = Number(prNumber);
  if (conclusion === 'success') {
    await addLabel(octokit, owner, repo, prNum, E2E_PASSED_LABEL);
    await removeLabel(octokit, owner, repo, prNum, E2E_FAILED_LABEL);
  } else {
    await addLabel(octokit, owner, repo, prNum, E2E_FAILED_LABEL);
    await removeLabel(octokit, owner, repo, prNum, E2E_PASSED_LABEL);
  }
};

/** Close orphaned "Run Gating Tests" check-runs that belong to older workflow runs. */
export const closeOrphans = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
  keepCheckRunId: number,
  detailsUrl: string,
): Promise<void> => {
  try {
    await closeOrphanedCheckRuns(
      octokit,
      owner,
      repo,
      headSha,
      GATING_CHECK_NAME,
      keepCheckRunId,
      detailsUrl,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not close orphaned check-runs: ${msg}`);
  }
};
