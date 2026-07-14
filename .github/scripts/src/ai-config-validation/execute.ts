import { runAiConfigValidation } from './run-validation';
import { createOctokit } from '../github-repo';
import { setCommitStatus } from '../github-comments';
import { AI_CONFIG } from './constants';
import { HandledValidationError } from './errors';
import type { GitHubConfig } from '../types/index';
import { safeErrorMessage } from '../utils';

export type AiConfigValidationInput = {
  config: GitHubConfig;
  eventAction?: string;
  headSha?: string;
  prNumber: number;
};

/** Run AI/editor configuration validation for a pull request. */
export const executeAiConfigValidation = async (input: AiConfigValidationInput): Promise<void> => {
  const { config, prNumber, headSha, eventAction } = input;
  const octokit = createOctokit(config);

  const outcome = await runAiConfigValidation({
    octokit,
    config,
    prNumber,
    headSha,
    event: { action: eventAction },
  });

  if (outcome.kind === 'skipped') {
    console.log('Skipped: skip-ai-config-check label present.');
    return;
  }

  if (outcome.kind === 'failed') {
    throw new HandledValidationError(
      'AI configuration validation failed. An OWNERS reviewer can comment /ai-approved after security review to re-run validation.',
    );
  }

  console.log('AI configuration validation passed.');
};

export const reportAiConfigError = async (
  config: GitHubConfig,
  headSha: string | undefined,
  err: unknown,
): Promise<void> => {
  console.error('Unexpected error:', safeErrorMessage(err));
  if (!headSha) {
    return;
  }

  try {
    const octokit = createOctokit(config);
    await setCommitStatus(
      octokit,
      config.owner,
      config.repo,
      headSha,
      'error',
      'AI configuration validation encountered an unexpected error',
      AI_CONFIG.STATUS_CONTEXT,
    );
  } catch {
    // best-effort
  }
};
