/* eslint-disable no-console */
import { createOctokit } from '../../github-repo';
import { reportAiConfigError, reportCiScriptsError } from '../pr-path-validation/execute';
import { requireEnv, safeErrorMessage } from '../../utils';
import { AI_LABELS, CI_LABELS, verifyReviewLabel } from './verify';
import type { GitHubConfig } from '../../types/index';

const main = async (): Promise<void> => {
  const labelName = requireEnv('LABEL_NAME');
  const config: GitHubConfig = {
    token: requireEnv('GITHUB_TOKEN'),
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
  };

  await verifyReviewLabel({
    octokit: createOctokit(config),
    config,
    labelName,
    sender: requireEnv('SENDER'),
    baseBranch: requireEnv('BASE_BRANCH'),
    prNumber: parseInt(requireEnv('PR_NUMBER'), 10),
    headSha: process.env.PR_HEAD_SHA,
  });
};

main().catch(async (err) => {
  console.error(safeErrorMessage(err));

  const labelName = process.env.LABEL_NAME ?? '';
  const config: GitHubConfig = {
    token: process.env.GITHUB_TOKEN ?? '',
    owner: process.env.REPO_OWNER ?? '',
    repo: process.env.REPO_NAME ?? '',
  };
  const headSha = process.env.PR_HEAD_SHA;

  if (AI_LABELS.has(labelName)) {
    await reportAiConfigError(config, headSha, err);
  } else if (CI_LABELS.has(labelName)) {
    await reportCiScriptsError(config, headSha, err);
  }

  process.exit(1);
});
