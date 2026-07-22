/**
 * Cleanup-all busy check — block cleanup if matched clusters have active CI.
 * Entry point: npx tsx src/infra/cleanup-busy-check.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, MATCHED_CLUSTERS (JSON array)
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { failStep } from '../shared/output';
import { checkBusyClusters } from './check-ci-activity';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const clusters: string[] = JSON.parse(process.env.MATCHED_CLUSTERS || '[]');
  const octokit = new Octokit({ auth: token });

  const busy = await checkBusyClusters(octokit, owner, repo, clusters);

  if (busy.length > 0) {
    failStep(
      `Refusing to clean up — these matched clusters have active CI jobs: ${busy.join(', ')}. Wait for them to finish, or narrow cluster_name to exclude them.`,
    );
  } else {
    console.log('No active CI jobs found on any matched cluster — safe to proceed.');
  }
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
