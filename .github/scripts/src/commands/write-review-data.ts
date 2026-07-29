/**
 * Capture review event data into a JSON file for the downstream
 * workflow_run-triggered workflow (pr_review_commands_sync.yml).
 *
 * Entry point: npx tsx src/commands/write-review-data.ts
 *
 * Required env: PR_NUMBER, REVIEW_STATE, REVIEW_AUTHOR, PR_AUTHOR, BASE_BRANCH
 */

import { writeFileSync } from 'node:fs';

import { requireEnv } from '../utils';

import { failStep } from '../shared/output';

const main = (): void => {
  const data = {
    baseBranch: requireEnv('BASE_BRANCH'),
    prAuthor: requireEnv('PR_AUTHOR'),
    prNumber: Number(requireEnv('PR_NUMBER')),
    reviewAuthor: requireEnv('REVIEW_AUTHOR'),
    reviewState: requireEnv('REVIEW_STATE'),
  };

  writeFileSync('review-data.json', JSON.stringify(data));
  console.log(`Captured review data: ${JSON.stringify(data)}`);
};

try {
  main();
} catch (err) {
  failStep(err instanceof Error ? err.message : String(err));
}
