import type { Octokit } from '@octokit/rest';

import { createOctokit, createStatusOctokit } from '../../github-repo';
import type { GitHubConfig } from '../../types/index';
import { safeErrorMessage } from '../../utils';
import { scanForSuspiciousPatterns } from '../ai-config-validation/checks';
import { AI_CONFIG } from '../ai-config-validation/constants';
import { CI_SCRIPTS_CONFIG } from '../ci-scripts-validation/constants';
import { I18N_CONFIG } from '../i18n-validation/constants';
import { HandledValidationError } from './errors';
import type { PathValidationOutcome } from './run-validation';
import { runPathValidation } from './run-validation';
import type { PathValidationConfig } from './types';

export type PathValidationInput = {
  /** The PR's actual base branch -- used only to verify the skip label's applier against OWNERS at that ref. */
  baseBranch: string;
  config: GitHubConfig;
  eventAction?: string;
  /** Pre-fetched changed files -- lets a caller running multiple path validations for the same PR share one fetch instead of each doing its own. */
  files?: Array<{ filename: string; patch?: string }>;
  /** Injectable for tests; default to real Octokit clients built from config. */
  octokit?: Octokit;
  prNumber: number;
  statusOctokit?: Octokit;
};

/** Run path-based validation; throws HandledValidationError on failure (already reported via labels). */
export const executePathValidation = async (
  input: PathValidationInput,
  pathConfig: PathValidationConfig,
  onFilesFetched?: (files: Array<{ filename: string; patch?: string }>) => void,
): Promise<PathValidationOutcome> => {
  const { baseBranch, config, eventAction, files, prNumber } = input;
  const octokit = input.octokit ?? createOctokit(config);
  const statusOctokit = input.statusOctokit ?? createStatusOctokit(config);

  const outcome: PathValidationOutcome = await runPathValidation(
    {
      baseBranch,
      config,
      event: { action: eventAction },
      files,
      octokit,
      prNumber,
      statusOctokit,
    },
    pathConfig,
    onFilesFetched,
  ).catch((err) => {
    const message = `${pathConfig.displayName} encountered an unexpected error`;
    throw new HandledValidationError(`${message}: ${safeErrorMessage(err)}`);
  });

  if (outcome.kind === 'failed') {
    throw new HandledValidationError(
      `${pathConfig.displayName} failed. An OWNERS reviewer can comment ${pathConfig.commandName} after security review to re-run validation.`,
    );
  }

  return outcome;
};

const logSuspiciousMatches = (files: Array<{ filename: string; patch?: string }>): void => {
  const matches = scanForSuspiciousPatterns(files);
  if (matches.length === 0) {
    return;
  }

  console.warn('Suspicious patterns detected in AI/editor config diff:');
  for (const match of matches) {
    console.warn(`- [${match.pattern}] ${match.file}`);
  }
};

/** Run AI/editor configuration validation for a pull request. */
export const executeAiConfigValidation = async (input: PathValidationInput): Promise<void> => {
  const outcome = await executePathValidation(input, AI_CONFIG, logSuspiciousMatches);

  if (outcome.kind === 'skipped') {
    console.log('Skipped: skip-ai-config-check label present.');
    return;
  }

  console.log('AI configuration validation passed.');
};

/** Run CI configuration validation for a pull request. */
export const executeCiScriptsValidation = async (input: PathValidationInput): Promise<void> => {
  const outcome = await executePathValidation(input, CI_SCRIPTS_CONFIG);

  if (outcome.kind === 'skipped') {
    console.log('Skipped: skip-ci-scripts-check label present.');
    return;
  }

  console.log('CI configuration validation passed.');
};

/** Run translation catalog validation for a pull request. */
export const executeI18nValidation = async (input: PathValidationInput): Promise<void> => {
  const outcome = await executePathValidation(input, I18N_CONFIG);

  if (outcome.kind === 'skipped') {
    console.log('Skipped: skip-i18n-check label present.');
    return;
  }

  console.log('Translations validation passed.');
};
