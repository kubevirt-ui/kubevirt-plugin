import { createOctokit } from '../../github-repo';
import type { GitHubConfig } from '../../types/index';
import { requireEnv, safeErrorMessage } from '../../utils';
import { verifyMergePoolHoldRemoval, verifyMergePoolLabel } from './verify';

const main = async (): Promise<void> => {
  const config: GitHubConfig = {
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
    token: requireEnv('GITHUB_TOKEN'),
  };
  const eventAction = requireEnv('EVENT_ACTION');
  const octokit = createOctokit(config);
  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const sender = requireEnv('SENDER');

  if (eventAction === 'unlabeled') {
    await verifyMergePoolHoldRemoval({ config, octokit, prNumber, sender });
    return;
  }

  await verifyMergePoolLabel({
    baseBranch: requireEnv('BASE_BRANCH'),
    config,
    labelName: requireEnv('LABEL_NAME'),
    octokit,
    prAuthor: requireEnv('PR_AUTHOR'),
    prNumber,
    sender,
  });
};

void main().catch((err) => {
  console.error(safeErrorMessage(err));
  process.exit(1);
});
