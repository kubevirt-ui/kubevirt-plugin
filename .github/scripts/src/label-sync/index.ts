/**
 * Unified entry point for the PR Label Sync workflow.
 *
 * Receives the `labeled` / `unlabeled` event context and routes to:
 *   - Verify merge-pool label trust (lgtm, approved, do-not-merge/hold)
 *   - Dispatch retest if PR just became pool-eligible while stale
 *   - Both (e.g. hold removal)
 *   - Exit 0 (any other label — no action needed)
 *
 * Entry point: npx tsx src/label-sync/index.ts
 *
 * Required env: GITHUB_TOKEN, LABEL_NAME, EVENT_ACTION,
 *               PR_NUMBER, PR_HEAD_SHA, PR_BASE_REF, PR_LABELS (JSON),
 *               SENDER, PR_AUTHOR, BASE_BRANCH, REPO_OWNER, REPO_NAME,
 *               PR_HEAD_REPO
 */

import { Octokit } from '@octokit/rest';

import { createOctokit } from '../github-repo';
import { isMergePoolPr } from '../shared/merge-pool';
import { failStep } from '../shared/output';
import { isListedInLocalOwners } from '../shared/owners';
import { dispatchWorkflow } from '../shared/dispatch';
import { getRepoContext } from '../shared/actions-context';
import type { GitHubConfig } from '../types/index';
import { requireEnv, safeErrorMessage } from '../utils';
import {
  verifyMergePoolHoldRemoval,
  verifyMergePoolLabel,
} from '../validation/verify-merge-pool-labels/verify';

const VERIFY_ON_LABELED = new Set(['lgtm', 'approved', 'do-not-merge/hold']);
const RETEST_ON_LABELED = new Set(['lgtm', 'approved']);
const RETEST_ON_UNLABELED = new Set(['do-not-merge/hold', 'hold', 'needs-rebase']);

type Route = { verify: boolean; retest: boolean };

const resolveRoute = (labelName: string, action: string): Route => {
  if (action === 'labeled') {
    return {
      retest: RETEST_ON_LABELED.has(labelName),
      verify: VERIFY_ON_LABELED.has(labelName),
    };
  }
  if (action === 'unlabeled') {
    if (labelName === 'do-not-merge/hold') {
      return { retest: true, verify: true };
    }
    if (RETEST_ON_UNLABELED.has(labelName) || labelName.startsWith('do-not-merge/')) {
      return { retest: true, verify: false };
    }
  }
  return { retest: false, verify: false };
};

const STALE_TITLES = [
  'Hot Cluster E2E: stale -- main has advanced since this ran',
  'Stale -- main has advanced since this ran',
];

const runVerify = async (config: GitHubConfig, action: string): Promise<void> => {
  const octokit = createOctokit(config);
  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const sender = requireEnv('SENDER');

  if (action === 'unlabeled') {
    await verifyMergePoolHoldRemoval({ config, octokit, prNumber, sender });
  } else {
    await verifyMergePoolLabel({
      baseBranch: requireEnv('BASE_BRANCH'),
      config,
      labelName: requireEnv('LABEL_NAME'),
      octokit,
      prAuthor: requireEnv('PR_AUTHOR'),
      prNumber,
      sender,
    });
  }
};

const runRetest = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const headSha = requireEnv('PR_HEAD_SHA');
  const baseRef = requireEnv('BASE_BRANCH');
  const labels = JSON.parse(requireEnv('PR_LABELS')) as Array<{ name: string }>;
  const prAuthor = requireEnv('PR_AUTHOR');
  const headRepoFullName = process.env.PR_HEAD_REPO ?? '';
  const baseRepoFullName = `${owner}/${repo}`;
  const octokit = new Octokit({ auth: token });

  if (!isMergePoolPr(labels)) {
    console.log(`PR #${prNumber} is not merge-pool eligible yet -- skipping retest.`);
    return;
  }

  const ownedByAuthor = isListedInLocalOwners(prAuthor);
  const sameRepo = headRepoFullName === baseRepoFullName;
  const hasOkToTest = labels.some((label) => label.name === 'ok-to-test');
  const trusted = ownedByAuthor || sameRepo || hasOkToTest;

  if (!trusted) {
    console.log(`PR #${prNumber} is pool-eligible but not CI-trusted -- skipping retest.`);
    return;
  }

  const { data: existing } = await octokit.checks.listForRef({
    check_name: 'Run Gating Tests',
    owner,
    ref: headSha,
    repo,
  });
  const [latest] = [...existing.check_runs].sort(
    (a, b) => new Date(b.started_at ?? '').getTime() - new Date(a.started_at ?? '').getTime(),
  );

  const isStale =
    latest?.status === 'completed' && STALE_TITLES.includes(latest.output?.title ?? '');

  if (!isStale) {
    console.log(
      `PR #${prNumber}: check (${latest?.output?.title ?? 'none'}) isn't stale -- skipping retest.`,
    );
    return;
  }

  console.log(`PR #${prNumber} just became pool-eligible while stale -- dispatching fresh retest.`);
  await dispatchWorkflow(octokit, {
    inputs: {
      base_ref: baseRef,
      is_pool_retest: 'true',
      pr_number: String(prNumber),
    },
    owner,
    ref: 'main',
    repo,
    workflowId: 'hot-cluster-e2e.yml',
  });
};

export const main = async (): Promise<void> => {
  const labelName = requireEnv('LABEL_NAME');
  const action = requireEnv('EVENT_ACTION');
  const route = resolveRoute(labelName, action);

  if (!route.verify && !route.retest) {
    console.log(`Label "${labelName}" (${action}) does not require action -- exiting cleanly.`);
    return;
  }

  const config: GitHubConfig = {
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
    token: requireEnv('GITHUB_TOKEN'),
  };

  console.log(`Label "${labelName}" (${action}) → verify=${route.verify}, retest=${route.retest}`);

  if (route.verify) {
    await runVerify(config, action);
  }
  if (route.retest) {
    await runRetest();
  }
};

if (require.main === module) {
  void main().catch((err) => {
    console.error(safeErrorMessage(err));
    process.exit(1);
  });
}
