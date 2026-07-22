/**
 * React with rocket and post a comment on the PR after dispatching
 * deploy-manual-console.yml teardown.
 *
 * Entry point: npx tsx src/commands/cleanup-manual-console-react.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY,
 *               COMMENT_ID, ISSUE_NUMBER, CLUSTER_NAME
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext } from '../shared/actions-context';
import { reactToComment } from '../shared/command-helpers';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const commentId = Number(requireEnv('COMMENT_ID'));
  const issueNumber = Number(requireEnv('ISSUE_NUMBER'));
  const clusterName = requireEnv('CLUSTER_NAME');
  const octokit = new Octokit({ auth: token });

  await reactToComment(octokit, owner, repo, commentId, 'rocket');

  const serverUrl = process.env.GITHUB_SERVER_URL ?? 'https://github.com';
  const repository = requireEnv('GITHUB_REPOSITORY');
  const runUrl = `${serverUrl}/${repository}/actions/workflows/deploy-manual-console.yml`;

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: [
      `🧹 Dispatched a manual console teardown for this PR (cluster \`${clusterName}\`).`,
      '',
      `If no manual console exists for this PR, the teardown run is a harmless no-op -- check the [Actions tab](${runUrl}) for progress.`,
    ].join('\n'),
  });
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
