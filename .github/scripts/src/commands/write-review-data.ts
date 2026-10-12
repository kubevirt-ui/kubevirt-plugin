/**
 * Capture review event data into a JSON file for the downstream
 * workflow_run-triggered workflow (pr_review_commands_sync.yml).
 *
 * Exits cleanly (0) when the review is from a bot or is not an
 * approval/changes_requested — no data file is written.
 *
 * Entry point: npx tsx src/commands/write-review-data.ts
 *
 * Required env: PR_NUMBER, REVIEW_STATE, REVIEW_AUTHOR, PR_AUTHOR,
 *               BASE_BRANCH, REVIEW_USER
 */

import { writeFileSync } from 'node:fs';

import { requireEnv } from '../utils';

import { failStep } from '../shared/output';

const ACTIONABLE_STATES = new Set(['APPROVED', 'CHANGES_REQUESTED']);

const main = (): void => {
  const reviewUser = requireEnv('REVIEW_USER');
  const reviewState = requireEnv('REVIEW_STATE');

  if (reviewUser.endsWith('[bot]')) {
    console.log(`Bot review from "${reviewUser}" -- nothing to do.`);
    return;
  }

  if (!ACTIONABLE_STATES.has(reviewState)) {
    console.log(`Review state "${reviewState}" -- only approvals/change-requests are captured.`);
    return;
  }

  const data = {
    baseBranch: requireEnv('BASE_BRANCH'),
    prAuthor: requireEnv('PR_AUTHOR'),
    prNumber: Number(requireEnv('PR_NUMBER')),
    reviewAuthor: requireEnv('REVIEW_AUTHOR'),
    reviewState,
  };

  writeFileSync('review-data.json', JSON.stringify(data));
  console.log(`Captured review data: ${JSON.stringify(data)}`);
};

try {
  main();
} catch (err) {
  failStep(err instanceof Error ? err.message : String(err));
}
