/* eslint-disable no-console */
import { createOctokit } from '../github-repo';
import { setCommitStatus } from '../github-comments';
import { requireEnv, safeErrorMessage } from '../utils';
import type { GitHubConfig } from '../types/index';
import { executeJiraValidation } from './execute';

const main = async (): Promise<void> => {
  const ghConfig: GitHubConfig = {
    token: requireEnv('GITHUB_TOKEN'),
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
  };

  await executeJiraValidation({
    baseBranch: requireEnv('BASE_BRANCH'),
    config: ghConfig,
    headSha: process.env.PR_HEAD_SHA,
    prNumber: parseInt(requireEnv('PR_NUMBER'), 10),
    prTitle: requireEnv('PR_TITLE'),
  });
};

main().catch(async (err) => {
  console.error('Unexpected error:', safeErrorMessage(err));
  const headSha = process.env.PR_HEAD_SHA;
  if (headSha) {
    try {
      const ghConfig: GitHubConfig = {
        token: process.env.GITHUB_TOKEN ?? '',
        owner: process.env.REPO_OWNER ?? '',
        repo: process.env.REPO_NAME ?? '',
      };
      const octokit = createOctokit(ghConfig);
      await setCommitStatus(
        octokit,
        ghConfig.owner,
        ghConfig.repo,
        headSha,
        'error',
        'Jira validation encountered an unexpected error',
      );
    } catch {
      // best-effort
    }
  }
  process.exit(1);
});
