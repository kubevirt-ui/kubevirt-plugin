/**
 * Parse the review-data.json artifact and set step outputs for downstream
 * steps (pr_number, review_state, review_author, pr_author, base_branch).
 *
 * Required env: GITHUB_OUTPUT, GITHUB_WORKSPACE
 * Reads: $GITHUB_WORKSPACE/review-data.json
 */

import { readFileSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { requireEnv } from '../utils';

type ReviewData = {
  prNumber: number;
  reviewState: string;
  reviewAuthor: string;
  prAuthor: string;
  baseBranch: string;
};

const main = async (): Promise<void> => {
  const workspace = requireEnv('GITHUB_WORKSPACE');
  const dataPath = resolve(workspace, 'review-data.json');
  const data = JSON.parse(readFileSync(dataPath, 'utf8')) as ReviewData;

  const lines = [
    `pr_number=${data.prNumber}`,
    `review_state=${data.reviewState}`,
    `review_author=${data.reviewAuthor}`,
    `pr_author=${data.prAuthor}`,
    `base_branch=${data.baseBranch}`,
  ];

  appendFileSync(process.env.GITHUB_OUTPUT!, lines.join('\n') + '\n');
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
