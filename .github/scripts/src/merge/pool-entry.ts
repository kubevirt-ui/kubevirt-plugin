/**
 * Retest on pool entry — dispatch E2E if PR just became pool-eligible
 * while its check is stale.
 * Entry point: npx tsx src/merge/pool-entry.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, PR_HEAD_SHA,
 *               PR_BASE_REF, PR_LABELS (JSON), PR_AUTHOR, PR_HEAD_REPO
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { isMergePoolPr } from '../shared/merge-pool';
import { isListedInLocalOwners } from '../shared/owners';
import { dispatchWorkflow } from '../shared/dispatch';
import { failStep } from '../shared/output';

const STALE_TITLES = [
  'Hot Cluster E2E: stale -- main has advanced since this ran',
  'Stale -- main has advanced since this ran',
];

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const headSha = requireEnv('PR_HEAD_SHA');
  const baseRef = requireEnv('PR_BASE_REF');
  const labels: Array<{ name: string }> = JSON.parse(requireEnv('PR_LABELS'));
  const prAuthor = requireEnv('PR_AUTHOR');
  const headRepoFullName = process.env.PR_HEAD_REPO ?? '';
  const baseRepoFullName = `${owner}/${repo}`;
  const octokit = new Octokit({ auth: token });

  if (!isMergePoolPr(labels)) {
    console.log(`PR #${prNumber} is not merge-pool eligible yet -- nothing to do.`);
    return;
  }

  const ownedByAuthor = isListedInLocalOwners(prAuthor);
  const sameRepo = headRepoFullName === baseRepoFullName;
  const hasOkToTest = labels.some((l) => l.name === 'ok-to-test');
  const trusted = ownedByAuthor || sameRepo || hasOkToTest;

  if (!trusted) {
    console.log(`PR #${prNumber} is pool-eligible but not CI-trusted -- skipping dispatch.`);
    return;
  }

  const { data: existing } = await octokit.checks.listForRef({
    owner,
    repo,
    ref: headSha,
    check_name: 'Run Gating Tests',
  });
  const [latest] = existing.check_runs.sort(
    (a, b) => new Date(b.started_at ?? '').getTime() - new Date(a.started_at ?? '').getTime(),
  );

  const isStale =
    latest?.status === 'completed' && STALE_TITLES.includes(latest.output?.title ?? '');

  if (!isStale) {
    console.log(
      `PR #${prNumber}: current check (${latest?.output?.title ?? 'none'}) isn't stale -- nothing to do.`,
    );
    return;
  }

  console.log(`PR #${prNumber} just became pool-eligible while stale -- dispatching fresh retest.`);
  await dispatchWorkflow(octokit, {
    owner,
    repo,
    workflowId: 'hot-cluster-e2e.yml',
    ref: 'main',
    inputs: {
      pr_number: String(prNumber),
      base_ref: baseRef,
      is_pool_retest: 'true',
    },
  });
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
