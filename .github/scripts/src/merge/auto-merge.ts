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
 * No Checks API calls needed.
 */

import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { getMergePoolBlockers } from '../shared/merge-pool';
import { addStepSummary, failStep } from '../shared/output';
import type { Reason } from './merge-eligibility';
import { describeEligibility } from './merge-eligibility';

type EligibilityResult = {
  determined: boolean;
  eligible: boolean;
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
      nodeId: pullRequest.node_id,
      reasons: prReasons,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `Could not determine merge-pool eligibility for PR #${prNumber}: ${msg} -- failing closed.`,
    );
    return { determined: false, eligible: false, nodeId: '', reasons: [] };
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
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
