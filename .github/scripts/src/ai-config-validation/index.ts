import { runAiConfigValidation } from './run-validation';
import { createOctokit } from '../github-repo';
import { setCommitStatus } from '../github-comments';
import { AI_CONFIG_REVIEWED_LABEL, AI_CONFIG_STATUS_CONTEXT } from '../types/index';
import type { GitHubConfig } from '../types/index';
import { requireEnv, safeErrorMessage } from '../utils';

const loadContext = () => ({
  config: {
    token: requireEnv('GITHUB_TOKEN'),
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
  } satisfies GitHubConfig,
  prNumber: parseInt(requireEnv('PR_NUMBER'), 10),
  headSha: process.env.PR_HEAD_SHA,
  event: {
    action: process.env.GITHUB_EVENT_ACTION,
  },
});

/** Entrypoint: detect AI/editor config changes and gate merge via labels only. */
const main = async (): Promise<void> => {
  const { config, prNumber, headSha, event } = loadContext();
  const octokit = createOctokit(config);

  const outcome = await runAiConfigValidation({
    octokit,
    config,
    prNumber,
    headSha,
    event,
  });

  if (outcome.kind === 'skipped') {
    console.log('Skipped: skip-ai-config-check label present.');
    return;
  }

  if (outcome.kind === 'failed') {
    console.error(
      `AI configuration validation failed. Add "${AI_CONFIG_REVIEWED_LABEL}" label after security review.`,
    );
    process.exit(1);
  }

  console.log('AI configuration validation passed.');
};

main().catch(async (err) => {
  console.error('Unexpected error:', safeErrorMessage(err));
  const headSha = process.env.PR_HEAD_SHA;
  if (!headSha) {
    process.exit(1);
  }

  try {
    const octokit = createOctokit({
      token: process.env.GITHUB_TOKEN ?? '',
      owner: process.env.REPO_OWNER ?? '',
      repo: process.env.REPO_NAME ?? '',
    });
    await setCommitStatus(
      octokit,
      process.env.REPO_OWNER ?? '',
      process.env.REPO_NAME ?? '',
      headSha,
      'error',
      'AI configuration validation encountered an unexpected error',
      AI_CONFIG_STATUS_CONTEXT,
    );
  } catch {
    // best-effort
  }
  process.exit(1);
});
