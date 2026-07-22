/**
 * React with rocket and post a comment on the PR after dispatching
 * deploy-manual-console.yml.
 *
 * Entry point: npx tsx src/commands/deploy-manual-console-react.ts
 *
 * Required env: GITHUB_TOKEN, GITHUB_REPOSITORY,
 *               COMMENT_ID, ISSUE_NUMBER, CLUSTER_NAME, INFRA_TYPE
 */

import { Octokit } from '@octokit/rest';

import { requireEnv } from '../utils';
import { getRepoContext, getRunUrl } from '../shared/actions-context';
import { reactToComment } from '../shared/command-helpers';
import { failStep } from '../shared/output';

const main = async (): Promise<void> => {
  const token = requireEnv('GITHUB_TOKEN');
  const { owner, repo } = getRepoContext();
  const commentId = Number(requireEnv('COMMENT_ID'));
  const issueNumber = Number(requireEnv('ISSUE_NUMBER'));
  const clusterName = requireEnv('CLUSTER_NAME');
  const infraType = requireEnv('INFRA_TYPE');
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
      `🚀 Dispatched a manual console deploy for this PR (cluster \`${clusterName}\`, infrastructure \`${infraType}\`).`,
      '',
      "If that cluster isn't already up, it will be provisioned first, which can take a while -- check the Actions run for progress.",
      'Login credentials will be sent to Slack once the console is ready.',
      '',
      `If the PR author isn't listed in OWNERS, this dispatch will fail at its own trust check -- see the [Actions tab](${runUrl}) if nothing shows up.`,
    ].join('\n'),
  });
};

main().catch((err) => {
  failStep(err instanceof Error ? err.message : String(err));
});
