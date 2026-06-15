import type { Octokit } from '@octokit/rest';

import { addLabel, removeLabel, setCommitStatus } from '../github-comments';
import {
  AI_CONFIG_ALERT_LABEL,
  AI_CONFIG_BLOCK_LABEL,
  AI_CONFIG_STATUS_CONTEXT,
} from '../types/index';
import type { GitHubConfig } from '../types/index';

const LABEL_META = {
  alert: { color: 'f59e0b', description: 'PR modifies AI/editor config or PR automation scripts' },
  block: { color: 'b60205', description: 'Blocked until ai-config-reviewed label is added' },
} as const;

export type AiConfigValidationEvent = {
  action?: string;
};

type LabelSyncContext = {
  octokit: Octokit;
  config: GitHubConfig;
  prNumber: number;
  headSha?: string;
};

export const reportCommitStatus = async (
  ctx: LabelSyncContext,
  state: 'pending' | 'success' | 'failure' | 'error',
  description: string,
): Promise<void> => {
  if (!ctx.headSha) return;

  await setCommitStatus(
    ctx.octokit,
    ctx.config.owner,
    ctx.config.repo,
    ctx.headSha,
    state,
    description,
    AI_CONFIG_STATUS_CONTEXT,
  );
};

export const syncAiConfigLabels = async (
  ctx: LabelSyncContext,
  passed: boolean,
  hasSensitiveChanges: boolean,
): Promise<void> => {
  const { octokit, config, prNumber } = ctx;

  if (!hasSensitiveChanges) {
    await removeLabel(octokit, config.owner, config.repo, prNumber, AI_CONFIG_ALERT_LABEL);
    await removeLabel(octokit, config.owner, config.repo, prNumber, AI_CONFIG_BLOCK_LABEL);
    return;
  }

  await addLabel(
    octokit,
    config.owner,
    config.repo,
    prNumber,
    AI_CONFIG_ALERT_LABEL,
    LABEL_META.alert,
  );

  if (passed) {
    await removeLabel(octokit, config.owner, config.repo, prNumber, AI_CONFIG_BLOCK_LABEL);
    return;
  }

  await addLabel(
    octokit,
    config.owner,
    config.repo,
    prNumber,
    AI_CONFIG_BLOCK_LABEL,
    LABEL_META.block,
  );
};
