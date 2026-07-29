/**
 * Unified entry point for the PR Label Gate workflow.
 *
 * Receives the `labeled` event context and routes to:
 *   - Dispatch hot-cluster-e2e.yml (ok-to-test without e2e-hold)
 *   - Verify review label trust (ai-config-reviewed, ci-scripts-reviewed, skip-*)
 *   - Exit 0 (any other label — no action needed)
 *
 * Entry point: npx tsx src/label-gate/index.ts
 *
 * Required env: GITHUB_TOKEN, LABEL_NAME, PR_LABELS (JSON array of label names),
 *               PR_NUMBER, BASE_BRANCH, PR_HEAD_SHA, SENDER, REPO_OWNER, REPO_NAME
 */

import { Octokit } from '@octokit/rest';

import { createOctokit } from '../github-repo';
import { getRepoContext } from '../shared/actions-context';
import { dispatchWorkflowAndResolveRun } from '../shared/dispatch';
import { failStep, setOutput } from '../shared/output';
import type { GitHubConfig } from '../types/index';
import { requireEnv, safeErrorMessage } from '../utils';
import { AI_LABELS, CI_LABELS, verifyReviewLabel } from '../validation/verify-review-labels/verify';
import {
  reportAiConfigError,
  reportCiScriptsError,
} from '../validation/pr-path-validation/execute';

const REVIEW_LABELS = new Set([...AI_LABELS, ...CI_LABELS]);

type Action = 'dispatch-e2e' | 'none' | 'verify-review';

const resolveAction = (labelName: string, prLabels: string[]): Action => {
  if (labelName === 'ok-to-test') {
    return prLabels.includes('e2e-hold') ? 'none' : 'dispatch-e2e';
  }
  if (REVIEW_LABELS.has(labelName)) {
    return 'verify-review';
  }
  return 'none';
};

const dispatchE2e = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = requireEnv('PR_NUMBER');
  const baseRef = requireEnv('BASE_BRANCH');
  const octokit = new Octokit({ auth: token });

  const result = await dispatchWorkflowAndResolveRun(octokit, {
    inputs: {
      base_ref: baseRef,
      pr_number: prNumber,
      skip_pool_check: 'true',
    },
    owner,
    ref: 'main',
    repo,
    workflowId: 'hot-cluster-e2e.yml',
  });

  console.log(`Dispatched hot-cluster-e2e.yml for PR #${prNumber} (base: ${baseRef})`);

  if (result.runUrl) {
    console.log(`Resolved run: ${result.runUrl}`);
    setOutput('run_url', result.runUrl);
  } else {
    setOutput('run_url', '');
  }
};

const verifyReview = async (): Promise<void> => {
  const config: GitHubConfig = {
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
    token: requireEnv('GITHUB_TOKEN'),
  };

  await verifyReviewLabel({
    baseBranch: requireEnv('BASE_BRANCH'),
    config,
    headSha: process.env.PR_HEAD_SHA,
    labelName: requireEnv('LABEL_NAME'),
    octokit: createOctokit(config),
    prNumber: parseInt(requireEnv('PR_NUMBER'), 10),
    sender: requireEnv('SENDER'),
  });
};

const main = async (): Promise<void> => {
  const labelName = requireEnv('LABEL_NAME');
  const prLabels: string[] = JSON.parse(process.env.PR_LABELS ?? '[]');
  const action = resolveAction(labelName, prLabels);

  if (action === 'none') {
    console.log(`Label "${labelName}" does not require action -- exiting cleanly.`);
    return;
  }

  console.log(`Label "${labelName}" → action: ${action}`);

  if (action === 'dispatch-e2e') {
    await dispatchE2e();
  } else {
    await verifyReview();
  }
};

void main().catch(async (err) => {
  console.error(safeErrorMessage(err));

  const labelName = process.env.LABEL_NAME ?? '';
  const config: GitHubConfig = {
    owner: process.env.REPO_OWNER ?? '',
    repo: process.env.REPO_NAME ?? '',
    token: process.env.GITHUB_TOKEN ?? '',
  };
  const headSha = process.env.PR_HEAD_SHA;

  if (AI_LABELS.has(labelName)) {
    await reportAiConfigError(config, headSha, err);
  } else if (CI_LABELS.has(labelName)) {
    await reportCiScriptsError(config, headSha, err);
  }

  process.exit(1);
});
