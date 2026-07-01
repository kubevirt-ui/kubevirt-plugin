import type { Octokit } from '@octokit/rest';

import { scanForSuspiciousPatterns } from './checks';
import { reportCommitStatus, syncAiConfigLabels } from './label-sync';
import type { AiConfigValidationEvent } from './label-sync';
import { getSensitivePaths } from './paths';
import { buildStatusDescription } from './utils';
import { getPrLabelNames, removeLabel } from '../github-comments';
import { getPullRequestFiles } from '../github-repo';
import { AI_CONFIG } from './constants';
import type { GitHubConfig } from '../types/index';

export type { AiConfigValidationEvent };

export type AiConfigValidationContext = {
  octokit: Octokit;
  config: GitHubConfig;
  prNumber: number;
  headSha?: string;
  event: AiConfigValidationEvent;
};

export type AiConfigValidationOutcome =
  | { kind: 'skipped' }
  | { kind: 'passed' | 'failed'; sensitivePaths: string[] };

const logSuspiciousMatches = (files: Array<{ filename: string; patch?: string }>): void => {
  const matches = scanForSuspiciousPatterns(files);
  if (matches.length === 0) return;

  console.warn('Suspicious patterns detected in AI/editor config diff:');
  for (const match of matches) {
    console.warn(`- [${match.pattern}] ${match.file}: ${match.line}`);
  }
};

/** Run AI/editor configuration validation for a pull request. */
export const runAiConfigValidation = async (
  ctx: AiConfigValidationContext,
): Promise<AiConfigValidationOutcome> => {
  const labelCtx = {
    octokit: ctx.octokit,
    config: ctx.config,
    prNumber: ctx.prNumber,
    headSha: ctx.headSha,
  };

  await reportCommitStatus(labelCtx, 'pending', 'AI configuration validation in progress…');

  const files = await getPullRequestFiles(
    ctx.octokit,
    ctx.config.owner,
    ctx.config.repo,
    ctx.prNumber,
  );
  const sensitivePaths = getSensitivePaths(files.map((file) => file.filename));
  const hasSensitiveChanges = sensitivePaths.length > 0;

  logSuspiciousMatches(files);

  const prLabels = await getPrLabelNames(
    ctx.octokit,
    ctx.config.owner,
    ctx.config.repo,
    ctx.prNumber,
  );

  if (hasSensitiveChanges && prLabels.has(AI_CONFIG.LABELS.SKIP)) {
    await reportCommitStatus(
      labelCtx,
      'success',
      'AI configuration validation skipped (skip-ai-config-check)',
    );
    return { kind: 'skipped' };
  }

  if (
    hasSensitiveChanges &&
    ctx.event.action === 'synchronize' &&
    prLabels.has(AI_CONFIG.LABELS.REVIEWED)
  ) {
    await removeLabel(
      ctx.octokit,
      ctx.config.owner,
      ctx.config.repo,
      ctx.prNumber,
      AI_CONFIG.LABELS.REVIEWED,
    );
    prLabels.delete(AI_CONFIG.LABELS.REVIEWED);
  }

  const reviewed = prLabels.has(AI_CONFIG.LABELS.REVIEWED);
  const passed = !hasSensitiveChanges || reviewed;

  await syncAiConfigLabels(labelCtx, passed, hasSensitiveChanges);
  await reportCommitStatus(
    labelCtx,
    passed ? 'success' : 'failure',
    buildStatusDescription(passed, hasSensitiveChanges),
  );

  return {
    kind: passed ? 'passed' : 'failed',
    sensitivePaths,
  };
};
