/* eslint-disable no-console */
import { createOctokit } from '../../github-repo';
import type { GitHubConfig } from '../../types/index';
import { requireEnv, safeErrorMessage } from '../../utils';
import { verifyMergePoolHoldRemoval, verifyMergePoolLabel } from './verify';

const main = async (): Promise<void> => {
  const config: GitHubConfig = {
    token: requireEnv('GITHUB_TOKEN'),
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
  };
  const eventAction = requireEnv('EVENT_ACTION');
  const octokit = createOctokit(config);
  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const sender = requireEnv('SENDER');

  if (eventAction === 'unlabeled') {
    await verifyMergePoolHoldRemoval({ octokit, config, sender, prNumber });
    return;
  }

  await verifyMergePoolLabel({
    octokit,
    config,
    labelName: requireEnv('LABEL_NAME'),
    sender,
    baseBranch: requireEnv('BASE_BRANCH'),
    prNumber,
    prAuthor: requireEnv('PR_AUTHOR'),
  });
};

main().catch((err) => {
  console.error(safeErrorMessage(err));
  process.exit(1);
});
