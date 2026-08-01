/**
 * Auto-merge: determine merge-pool eligibility and toggle GitHub auto-merge.
 * Entry point: npx tsx src/merge/auto-merge.ts
 *
 * Required env: GITHUB_TOKEN, BOT_TOKEN (optional), GITHUB_REPOSITORY,
 *               PR_NUMBER
 *
 * The native job check ("Auto Merge / Evaluate Merge Eligibility") is the
 * branch-protection required check. When not eligible the job fails (red X)
 * with a step summary explaining why; when eligible it succeeds (green).
 * After a successful evaluation, older completed failures for the same check
 * name/SHA are superseded so they cannot keep the status rollup red.
 */

import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext, getRunUrl } from '../shared/actions-context';
import { closeOrphanedCheckRuns } from '../shared/close-orphaned-checks';
import { getMergePoolBlockers } from '../shared/merge-pool';
import { addStepSummary, failStep } from '../shared/output';
import type { Reason } from './merge-eligibility';
import { describeEligibility } from './merge-eligibility';

const MERGE_ELIGIBILITY_CHECK = 'Evaluate Merge Eligibility';

type EligibilityResult = {
  determined: boolean;
  eligible: boolean;
  headSha: string;
  nodeId: string;
  reasons: Reason[];
};

const evaluateEligibility = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<EligibilityResult> => {
  try {
    const { data: pullRequest } = await octokit.pulls.get({ owner, pull_number: prNumber, repo });
    const blockers = getMergePoolBlockers(pullRequest.labels);
    const isEligible =
      !blockers.missingLgtm && !blockers.missingApproved && blockers.blockingLabels.length === 0;
    const prReasons = describeEligibility(
      blockers.missingLgtm,
      blockers.missingApproved,
      blockers.blockingLabels,
    );
    console.log(
      `PR #${prNumber} labels: [${pullRequest.labels.map((label) => label.name).join(', ')}] -- merge-pool eligible: ${isEligible}`,
    );
    return {
      determined: true,
      eligible: isEligible,
      headSha: pullRequest.head.sha,
      nodeId: pullRequest.node_id,
      reasons: prReasons,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `Could not determine merge-pool eligibility for PR #${prNumber}: ${msg} -- failing closed.`,
    );
    return { determined: false, eligible: false, headSha: '', nodeId: '', reasons: [] };
  }
};

const buildStepSummary = (result: EligibilityResult): string => {
  if (!result.determined) {
    return (
      '## Merge Gate\n\n' +
      ':warning: Could not determine eligibility — failed to read PR labels. ' +
      'Failing closed until a later event retries.'
    );
  }
  if (result.eligible) {
    return (
      '## Merge Gate\n\n' +
      ':white_check_mark: **Merge-pool eligible** — PR carries `lgtm` + `approved` with no blocking labels.'
    );
  }
  const lines = result.reasons.map((reason) => `- **${reason.short}** — ${reason.long}`);
  return '## Merge Gate\n\n' + ':x: **Not eligible for merge**\n\n' + lines.join('\n');
};

const toggleAutoMerge = async (
  botToken: string,
  nodeId: string,
  eligible: boolean,
  prNumber: number,
): Promise<void> => {
  const gql = graphql.defaults({ headers: { authorization: `token ${botToken}` } });

  if (eligible) {
    try {
      await gql(
        `mutation($id: ID!) {
          enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: MERGE }) {
            pullRequest { autoMergeRequest { enabledAt } }
          }
        }`,
        { id: nodeId },
      );
      console.log(`Enabled auto-merge for PR #${prNumber}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not enable auto-merge for PR #${prNumber}: ${msg}`);
    }
  } else {
    try {
      await gql(
        `mutation($id: ID!) {
          disablePullRequestAutoMerge(input: { pullRequestId: $id }) {
            pullRequest { autoMergeRequest { enabledAt } }
          }
        }`,
        { id: nodeId },
      );
      console.log(`Disabled auto-merge for PR #${prNumber} (not merge-pool eligible).`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`No auto-merge to disable for PR #${prNumber} (${msg}).`);
    }
  }
};

/** Resolve this workflow job's check-run id (still in_progress while we run). */
const resolveCurrentEligibilityCheckRunId = async (
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<number | undefined> => {
  const runId = Number(process.env.GITHUB_RUN_ID ?? '0');
  if (!runId) {
    return undefined;
  }

  const { data } = await octokit.actions.listJobsForWorkflowRun({
    owner,
    repo,
    run_id: runId,
  });
  const job = data.jobs.find((entry) => entry.name === MERGE_ELIGIBILITY_CHECK);
  const match = job?.check_run_url?.match(/\/check-runs\/(\d+)/);
  return match ? Number(match[1]) : undefined;
};

/** Keep this run's check; cancel older stale Evaluate Merge Eligibility runs. */
const supersedeStaleEligibilityChecks = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
): Promise<void> => {
  if (!headSha) {
    return;
  }

  const detailsUrl = getRunUrl();

  try {
    const keepId = await resolveCurrentEligibilityCheckRunId(octokit, owner, repo);
    if (!keepId) {
      console.log(`No "${MERGE_ELIGIBILITY_CHECK}" check-run for this run; skipping orphan close.`);
      return;
    }

    await closeOrphanedCheckRuns(
      octokit,
      owner,
      repo,
      headSha,
      MERGE_ELIGIBILITY_CHECK,
      keepId,
      detailsUrl,
      { supersedeCompleted: true },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Could not supersede stale "${MERGE_ELIGIBILITY_CHECK}" checks: ${msg}`);
  }
};

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const botToken = process.env.BOT_TOKEN ?? token;
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const octokit = new Octokit({ auth: token });

  const result = await evaluateEligibility(octokit, owner, repo, prNumber);
  addStepSummary(buildStepSummary(result));

  if (result.determined && result.nodeId) {
    await toggleAutoMerge(botToken, result.nodeId, result.eligible, prNumber);
  }

  if (!result.eligible) {
    const short = result.reasons.map((reason) => reason.short).join(', ');
    failStep(`Not eligible: ${short ?? 'could not determine eligibility'}`);
  }

  // Only after success: neutralize older completed failures on this SHA so the
  // status rollup / merge box cannot stay blocked by superseded red checks.
  await supersedeStaleEligibilityChecks(octokit, owner, repo, result.headSha);
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
