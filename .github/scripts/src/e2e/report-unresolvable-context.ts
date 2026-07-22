/**
 * Report an unresolvable PR context — posts a comment on the PR explaining
 * that the Hot Cluster E2E run could not resolve head SHA / labels / mergeability.
 *
 * Entry point: npx tsx src/e2e/report-unresolvable-context.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID,
 *               PR_NUMBER, IS_POOL_RETEST
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext, getRunUrl } from '../shared/actions-context';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const runUrl = getRunUrl();
  const prNumber = Number(requireEnv('PR_NUMBER'));
  const isPoolRetest = process.env.IS_POOL_RETEST === 'true';
  const octokit = new Octokit({ auth: token });

  const trigger = isPoolRetest
    ? 'The automatic retest triggered after `main` advanced'
    : 'This Hot Cluster E2E run';

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: [
      `⚠️ ${trigger} could not resolve this PR's context ` +
        '(head SHA / labels / mergeability) and did not run.',
      '',
      'The existing "Run Gating Tests" result may be stale -- please comment `/retest-e2e` for a fresh result before merging.',
      '',
      `See the failed run for details: ${runUrl}`,
    ].join('\n'),
  });
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
