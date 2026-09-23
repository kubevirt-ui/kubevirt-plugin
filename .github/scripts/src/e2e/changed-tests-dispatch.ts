/**
 * Changed-tests dispatch — detects modified `.spec.ts` files outside the
 * gating folder and dispatches an informational hot-cluster-e2e.yml run so
 * non-gating tests touched by a PR are exercised automatically.
 *
 * Runs as a best-effort step after the gating gate dispatch. Failures are
 * logged but never surface as a workflow error (exit 0 on any catch).
 *
 * Entry point: npx tsx src/e2e/changed-tests-dispatch.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, BASE_REF
 */

import { Octokit } from '@octokit/rest';

import { getPullRequestFiles } from '../github-repo';
import { requireEnv } from '../utils';

import { getRepoContext } from '../shared/actions-context';
import { dispatchWorkflowAndResolveRun } from '../shared/dispatch';

const CHANGED_TEST_PATTERN = /^playwright\/tests\/(?!gating\/).+\.spec\.ts$/;

/**
 * Collect `.spec.ts` file paths changed in the PR that live outside the
 * gating folder (tier1, tier2, settings, api, etc.).
 */
const getChangedNonGatingTests = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<string[]> => {
  const files = await getPullRequestFiles(octokit, owner, repo, prNumber);
  return files
    .filter((f) => f.status !== 'removed')
    .map((f) => f.filename)
    .filter((name) => CHANGED_TEST_PATTERN.test(name));
};

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = requireEnv('PR_NUMBER');
  const baseRef = requireEnv('BASE_REF');
  const octokit = new Octokit({ auth: token });

  const changedTests = await getChangedNonGatingTests(octokit, owner, repo, Number(prNumber));

  if (changedTests.length === 0) {
    console.log('No non-gating test files changed — skipping auto dispatch.');
    return;
  }

  const testArgs = changedTests.join(' ');
  console.log(
    `Detected ${changedTests.length} changed non-gating test files:\n  ${changedTests.join('\n  ')}`,
  );

  const result = await dispatchWorkflowAndResolveRun(octokit, {
    inputs: {
      base_ref: baseRef,
      pr_number: prNumber,
      skip_pool_check: 'true',
      test_args: testArgs,
      test_project: 'auto',
    },
    owner,
    ref: 'main',
    repo,
    workflowId: 'hot-cluster-e2e.yml',
  });

  console.log('Dispatched auto run for changed non-gating test files.');
  if (result.runUrl) {
    console.log(`Resolved run: ${result.runUrl}`);
  }
};

void main().catch((err) => {
  // Log but never fail the workflow step.
  const msg = err instanceof Error ? err.message : String(err);
  console.warn(`Auto-dispatch for changed test files failed: ${msg}`);
});
