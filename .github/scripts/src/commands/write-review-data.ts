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
    prNumber: Number(requireEnv('PR_NUMBER')),
    reviewState: requireEnv('REVIEW_STATE'),
    reviewAuthor: requireEnv('REVIEW_AUTHOR'),
    prAuthor: requireEnv('PR_AUTHOR'),
    baseBranch: requireEnv('BASE_BRANCH'),
  };

  writeFileSync('review-data.json', JSON.stringify(data));
  console.log(`Captured review data: ${JSON.stringify(data)}`);
};

try {
  main();
} catch (err) {
  failStep(err instanceof Error ? err.message : String(err));
}
