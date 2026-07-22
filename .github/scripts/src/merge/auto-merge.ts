/**
 * Auto-merge: determine merge-pool eligibility and toggle GitHub auto-merge.
 * Entry point: npx tsx src/merge/auto-merge.ts
 *
 * Required env: GITHUB_TOKEN, BOT_TOKEN (optional), GITHUB_REPOSITORY,
 *               PR_NUMBER, GITHUB_RUN_ID
 */

import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';

import { getRepoContext } from '../shared/actions-context';
import {
  BARE_HOLD_LABEL,
  DO_NOT_MERGE_HOLD_LABEL,
  E2E_HOLD_LABEL,
  NEEDS_REBASE_LABEL,
  getMergePoolBlockers,
} from '../shared/merge-pool';
import { failStep, setOutput } from '../shared/output';
import { requireEnv } from '../utils';

type Reason = { short: string; long: string };

const describeBlockingLabel = (label: string): Reason => {
  if (label === E2E_HOLD_LABEL) {
    return {
      short: 'held via /hold-e2e',
      long: 'Hot Cluster E2E is on hold. Comment `/retest-e2e` to lift the hold and get a fresh result.',
    };
  }
  if (label === BARE_HOLD_LABEL || label === DO_NOT_MERGE_HOLD_LABEL) {
    return { short: 'held via /hold', long: 'Comment `/hold cancel` to lift the hold.' };
  }
  if (label === NEEDS_REBASE_LABEL) {
    return { short: 'needs-rebase', long: 'Update this PR with the latest base branch changes.' };
  }
  return { short: `blocked by \`${label}\``, long: `Resolve and clear the \`${label}\` label.` };
};

const describeEligibility = (
  missingLgtm: boolean,
  missingApproved: boolean,
  blockingLabels: string[],
): Reason[] => {
  const reasons: Reason[] = [];
  if (missingLgtm) {
    reasons.push({
      short: 'missing lgtm',
      long: 'Comment `/lgtm` (any collaborator), or get a native GitHub Approve review.',
    });
  }
  if (missingApproved) {
    reasons.push({
      short: 'missing approved',
      long: 'Comment `/approve` (root OWNERS), or get a native GitHub Approve review from an OWNERS approver.',
    });
  }
  for (const label of blockingLabels) {
    reasons.push(describeBlockingLabel(label));
  }
  return reasons;
};

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const botToken = process.env.BOT_TOKEN || token;
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const runId = Number(requireEnv('GITHUB_RUN_ID'));
  const octokit = new Octokit({ auth: token });

  let eligible: boolean;
  let nodeId = '';
  let determined = true;
  let reasons: Reason[] = [];
  let headSha: string;

  try {
    const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
    const blockers = getMergePoolBlockers(pr.labels);
    eligible =
      !blockers.missingLgtm && !blockers.missingApproved && blockers.blockingLabels.length === 0;
    reasons = describeEligibility(
      blockers.missingLgtm,
      blockers.missingApproved,
      blockers.blockingLabels,
    );
    headSha = pr.head.sha;
    nodeId = pr.node_id;
    console.log(
      `PR #${prNumber} labels: [${pr.labels.map((l) => l.name).join(', ')}] -- merge-pool eligible: ${eligible}`,
    );
  } catch (err) {
    determined = false;
    eligible = false;
    headSha = '';
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `Could not determine merge-pool eligibility for PR #${prNumber}: ${msg} -- failing closed.`,
    );
  }

  const conclusion = eligible ? 'success' : 'action_required';

  let title: string;
  let summary: string;

  if (!determined) {
    title = 'Could not determine eligibility';
    summary = 'Failed to read current PR labels -- failing closed until a later event retries.';
  } else if (eligible) {
    title = 'Merge-pool eligible';
    summary = 'PR carries lgtm+approved with no hold/do-not-merge label.';
  } else {
    title = `Not eligible: ${reasons.map((r) => r.short).join(', ')}`;
    summary = reasons.map((r) => `${r.short} -- ${r.long}`).join(' | ');
  }

  setOutput('determined', String(determined));
  setOutput('eligible', String(eligible));
  setOutput('node_id', nodeId);
  setOutput('number', String(prNumber));
  setOutput('head_sha', headSha);
  setOutput('conclusion', conclusion);
  setOutput('title', title);
  setOutput('summary', summary);

  // Publish a separate "Merge Gate" check-run via API.
  // This is the branch-protection required check (not the job's own check).
  // Uses action_required (orange) when not eligible, success (green) when eligible.
  const prHeadSha = process.env.PR_HEAD_SHA || headSha;
  if (prHeadSha) {
    try {
      await octokit.checks.create({
        owner,
        repo,
        name: 'Merge Gate',
        head_sha: prHeadSha,
        status: 'completed',
        conclusion,
        output: { title, summary },
        details_url: `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${owner}/${repo}/actions/runs/${runId}`,
      });
      console.log(`Published "Merge Gate" check-run: ${conclusion} — ${title}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Could not publish Merge Gate check-run: ${msg}`);
    }
  }

  // Toggle auto-merge via GraphQL
  if (determined && nodeId) {
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
  }

  // Job always exits 0 — the "Merge Gate" check-run is the real gate, not this job.
  // Even when not eligible, the job succeeds (green) and the check-run shows orange.
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
