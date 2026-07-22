/**
 * needs-rebase label sync — entry point for workflow YAML.
 * Entry point: npx tsx src/merge/needs-rebase-entry.ts
 *
 * Required env: BOT_TOKEN or GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { failStep } from '../shared/output';
import { syncNeedsRebaseLabel } from './needs-rebase';

const main = async (): Promise<void> => {
  const token = process.env.BOT_TOKEN || requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const octokit = new Octokit({ auth: token });

  const result = await syncNeedsRebaseLabel({ octokit, owner, repo, prNumber });
  console.log(`PR #${prNumber}: needs-rebase sync result: ${result}`);
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
