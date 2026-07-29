import { createOctokit } from '../../github-repo';
import type { GitHubConfig } from '../../types/index';
import { requireEnv, safeErrorMessage } from '../../utils';
import { reportAiConfigError, reportCiScriptsError } from '../pr-path-validation/execute';
import { AI_LABELS, CI_LABELS, verifyReviewLabel } from './verify';

const main = async (): Promise<void> => {
  const labelName = requireEnv('LABEL_NAME');
  const config: GitHubConfig = {
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
    token: requireEnv('GITHUB_TOKEN'),
  };

  await verifyReviewLabel({
    baseBranch: requireEnv('BASE_BRANCH'),
    config,
    headSha: process.env.PR_HEAD_SHA,
    labelName,
    octokit: createOctokit(config),
    prNumber: parseInt(requireEnv('PR_NUMBER'), 10),
    sender: requireEnv('SENDER'),
  });
};

void main().catch(async (err) => {
  console.error(safeErrorMessage(err));

  const labelName = process.env.LABEL_NAME ?? '';
  const config: GitHubConfig = {
    owner: process.env.REPO_OWNER ?? '',
    repo: process.env.REPO_NAME ?? '',
    token: process.env.GITHUB_TOKEN ?? '',
  };
  const headSha = process.env.PR_HEAD_SHA;

  if (AI_LABELS.has(labelName)) {
    await reportAiConfigError(config, headSha, err);
  } else if (CI_LABELS.has(labelName)) {
    await reportCiScriptsError(config, headSha, err);
  }

  process.exit(1);
});
