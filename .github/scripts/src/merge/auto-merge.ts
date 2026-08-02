/**
 * Auto-merge: determine merge-pool eligibility and toggle GitHub auto-merge.
 * Entry point: npx tsx src/merge/auto-merge.ts
 *
 * Required env: GITHUB_TOKEN, BOT_TOKEN (optional), GITHUB_REPOSITORY,
 *               PR_NUMBER, PR_HEAD_SHA
 *
 * Publishes a "Merge Gate" commit status (success / failure) instead of
 * relying on the native job exit code. Commit statuses only keep the latest
 * result per context — no accumulation of stale failures that block the
 * GitHub status rollup and auto-merge. The job itself always exits 0.
 */

import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';

import { setCommitStatus } from '../github-comments';
import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { getMergePoolBlockers } from '../shared/merge-pool';
import { addStepSummary, warnStep } from '../shared/output';
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

const MERGE_GATE_CONTEXT = 'Merge Gate';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const botToken = process.env.BOT_TOKEN ?? token;
  const headSha = requireEnv('PR_HEAD_SHA');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const octokit = new Octokit({ auth: token });

  const result = await evaluateEligibility(octokit, owner, repo, prNumber);
  addStepSummary(buildStepSummary(result));

  if (result.determined && result.nodeId) {
    await toggleAutoMerge(botToken, result.nodeId, result.eligible, prNumber);
  }

  const state = result.eligible ? 'success' : 'failure';
  const description = result.eligible
    ? 'Merge-pool eligible'
    : result.reasons.map((r) => r.short).join(', ') || 'could not determine eligibility';

  await setCommitStatus(octokit, owner, repo, headSha, state, description, MERGE_GATE_CONTEXT);

  if (!result.eligible) {
    warnStep(`Not eligible: ${description}`);
  }
};

void main().catch(async (err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`::error::${msg}`);

  const headSha = process.env.PR_HEAD_SHA;
  const fullRepo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (headSha && fullRepo && token) {
    const [owner, repo] = fullRepo.split('/');
    try {
      await setCommitStatus(
        new Octokit({ auth: token }),
        owner,
        repo,
        headSha,
        'failure',
        `Script error: ${msg}`.slice(0, 140),
        MERGE_GATE_CONTEXT,
      );
    } catch {
      console.error('Could not publish failure commit status.');
    }
  }
});
