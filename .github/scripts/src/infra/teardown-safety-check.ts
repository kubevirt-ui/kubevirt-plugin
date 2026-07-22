/**
 * Teardown safety check — block teardown if setup/e2e workflows are active.
 * Entry point: npx tsx src/infra/teardown-safety-check.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { failStep } from '../shared/output';
import { hasActiveWorkflows } from './check-ci-activity';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const octokit = new Octokit({ auth: token });

  const active = await hasActiveWorkflows(octokit, owner, repo);

  if (active > 0) {
    failStep(
      `Aborting teardown: ${active} setup/e2e workflow(s) are currently running. Use force=true to override.`,
    );
  } else {
    console.log('No active setup/e2e workflows. Proceeding with teardown.');
  }
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
