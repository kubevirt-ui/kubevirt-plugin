/* eslint-disable no-console */
import type { Octokit } from '@octokit/rest';

import { runPathValidation } from './run-validation';
import type { BuildStatusDescription, PathValidationOutcome } from './run-validation';
import { HandledValidationError } from './errors';
import { scanForSuspiciousPatterns } from '../ai-config-validation/checks';
import { AI_CONFIG } from '../ai-config-validation/constants';
import { buildStatusDescription as buildAiConfigStatusDescription } from '../ai-config-validation/utils';
import { CI_SCRIPTS_CONFIG } from '../ci-scripts-validation/constants';
import { buildStatusDescription as buildCiScriptsStatusDescription } from '../ci-scripts-validation/utils';
import { createOctokit, createStatusOctokit } from '../../github-repo';
import { safeErrorMessage } from '../../utils';
import type { GitHubConfig } from '../../types/index';
import type { PathValidationConfig } from './types';

export type PathValidationInput = {
  config: GitHubConfig;
  eventAction?: string;
  headSha?: string;
  prNumber: number;
  /** The PR's actual base branch -- used only to verify the skip label's applier against OWNERS at that ref. */
  baseBranch: string;
  /** Pre-fetched changed files -- lets a caller running multiple path validations for the same PR share one fetch instead of each doing its own. */
  files?: Array<{ filename: string; patch?: string }>;
  /** Injectable for tests; default to real Octokit clients built from config. */
  octokit?: Octokit;
  statusOctokit?: Octokit;
};

/** Run path-based validation; throws HandledValidationError on failure (already reported via label/status). */
export const executePathValidation = async (
  input: PathValidationInput,
  pathConfig: PathValidationConfig,
  buildStatusDescription: BuildStatusDescription,
  onFilesFetched?: (files: Array<{ filename: string; patch?: string }>) => void,
): Promise<PathValidationOutcome> => {
  const { config, prNumber, headSha, eventAction, baseBranch, files } = input;
  const octokit = input.octokit ?? createOctokit(config);
  const statusOctokit = input.statusOctokit ?? createStatusOctokit(config);

  let outcome: PathValidationOutcome;
  try {
    outcome = await runPathValidation(
      {
        baseBranch,
        config,
        event: { action: eventAction },
        files,
        headSha,
        octokit,
        prNumber,
        statusOctokit,
      },
      pathConfig,
      buildStatusDescription,
      onFilesFetched,
    );
  } catch (err) {
    const message = `${pathConfig.displayName} encountered an unexpected error`;
    throw new HandledValidationError(`${message}: ${safeErrorMessage(err)}`);
  }

  if (outcome.kind === 'failed') {
    throw new HandledValidationError(
      `${pathConfig.displayName} failed. An OWNERS reviewer can comment ${pathConfig.commandName} after security review to re-run validation.`,
    );
  }

  return outcome;
};

/** Best-effort "something broke" handler -- logs the error, never throws. */
export const reportPathValidationError = async (
  _config: GitHubConfig,
  _headSha: string | undefined,
  _pathConfig: Pick<PathValidationConfig, 'statusContext' | 'displayName'>,
  err: unknown,
): Promise<void> => {
  console.error('Unexpected error:', safeErrorMessage(err));
};

const logSuspiciousMatches = (files: Array<{ filename: string; patch?: string }>): void => {
  const matches = scanForSuspiciousPatterns(files);
  if (matches.length === 0) return;

  console.warn('Suspicious patterns detected in AI/editor config diff:');
  for (const match of matches) {
    console.warn(`- [${match.pattern}] ${match.file}`);
  }
};

/** Run AI/editor configuration validation for a pull request. */
export const executeAiConfigValidation = async (input: PathValidationInput): Promise<void> => {
  const outcome = await executePathValidation(
    input,
    AI_CONFIG,
    buildAiConfigStatusDescription,
    logSuspiciousMatches,
  );

  if (outcome.kind === 'skipped') {
    console.log('Skipped: skip-ai-config-check label present.');
    return;
  }

  console.log('AI configuration validation passed.');
};

export const reportAiConfigError = (
  config: GitHubConfig,
  headSha: string | undefined,
  err: unknown,
): Promise<void> => reportPathValidationError(config, headSha, AI_CONFIG, err);

/** Run CI configuration validation for a pull request. */
export const executeCiScriptsValidation = async (input: PathValidationInput): Promise<void> => {
  const outcome = await executePathValidation(
    input,
    CI_SCRIPTS_CONFIG,
    buildCiScriptsStatusDescription,
  );

  if (outcome.kind === 'skipped') {
    console.log('Skipped: skip-ci-scripts-check label present.');
    return;
  }

  console.log('CI configuration validation passed.');
};

export const reportCiScriptsError = (
  config: GitHubConfig,
  headSha: string | undefined,
  err: unknown,
): Promise<void> => reportPathValidationError(config, headSha, CI_SCRIPTS_CONFIG, err);
