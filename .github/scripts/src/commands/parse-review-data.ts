/**
 * Parse the review-data.json artifact and set step outputs for downstream
 * steps (pr_number, review_state, review_author, pr_author, base_branch).
 *
 * Required env: GITHUB_OUTPUT, GITHUB_WORKSPACE
 * Reads: $GITHUB_WORKSPACE/review-data.json
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { requireEnv } from '../utils';

import { failStep, setOutput } from '../shared/output';

type ReviewData = {
  baseBranch: string;
  prAuthor: string;
  prNumber: number;
  reviewAuthor: string;
  reviewState: string;
};

const main = async (): Promise<void> => {
  const workspace = requireEnv('GITHUB_WORKSPACE');
  const dataPath = resolve(workspace, 'review-data.json');
  const data = JSON.parse(readFileSync(dataPath, 'utf8')) as ReviewData;

  setOutput('pr_number', String(data.prNumber));
  setOutput('review_state', data.reviewState);
  setOutput('review_author', data.reviewAuthor);
  setOutput('pr_author', data.prAuthor);
  setOutput('base_branch', data.baseBranch);
};

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
