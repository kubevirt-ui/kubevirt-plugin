import { createOctokit } from '../../github-repo';
import type { GitHubConfig } from '../../types/index';
import { requireEnv, safeErrorMessage } from '../../utils';
import { verifyReviewLabel } from './verify';

const main = async (): Promise<void> => {
  const config: GitHubConfig = {
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
    token: requireEnv('GITHUB_TOKEN'),
  };

  await verifyReviewLabel({
    baseBranch: requireEnv('BASE_BRANCH'),
    config,
    labelName: requireEnv('LABEL_NAME'),
    octokit: createOctokit(config),
    prNumber: parseInt(requireEnv('PR_NUMBER'), 10),
    sender: requireEnv('SENDER'),
  });
};

void main().catch((err) => {
  console.error(safeErrorMessage(err));
  process.exit(1);
});
