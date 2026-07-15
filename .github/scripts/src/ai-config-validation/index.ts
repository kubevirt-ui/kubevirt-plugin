import { executeAiConfigValidation, reportAiConfigError } from './execute';
import { HandledValidationError } from './errors';
import { requireEnv } from '../utils';
import type { GitHubConfig } from '../types/index';

const main = async (): Promise<void> => {
  const config: GitHubConfig = {
    token: requireEnv('GITHUB_TOKEN'),
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
  };

  await executeAiConfigValidation({
    config,
    eventAction: process.env.GITHUB_EVENT_ACTION,
    headSha: process.env.PR_HEAD_SHA,
    prNumber: parseInt(requireEnv('PR_NUMBER'), 10),
  });
};

main().catch(async (err) => {
  if (!(err instanceof HandledValidationError)) {
    await reportAiConfigError(
      {
        token: process.env.GITHUB_TOKEN ?? '',
        owner: process.env.REPO_OWNER ?? '',
        repo: process.env.REPO_NAME ?? '',
      },
      process.env.PR_HEAD_SHA,
      err,
    );
  }
  process.exit(1);
});
