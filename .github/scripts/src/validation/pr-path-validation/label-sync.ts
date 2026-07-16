import type { Octokit } from '@octokit/rest';

import { addLabel, removeLabel, setCommitStatus } from '../../github-comments';
import type { GitHubConfig } from '../../types/index';
import type { PathValidationConfig } from './types';

export type PathValidationEvent = {
  action?: string;
};

export type LabelSyncContext = {
  octokit: Octokit;
  /** Commit statuses need a separate permission scope -- defaults to `octokit` when the caller has just one token. */
  statusOctokit?: Octokit;
  config: GitHubConfig;
  prNumber: number;
  headSha?: string;
};

export const reportCommitStatus = async (
  ctx: LabelSyncContext,
  pathConfig: PathValidationConfig,
  state: 'pending' | 'success' | 'failure' | 'error',
  description: string,
): Promise<void> => {
  if (!ctx.headSha) return;

  await setCommitStatus(
    ctx.statusOctokit ?? ctx.octokit,
    ctx.config.owner,
    ctx.config.repo,
    ctx.headSha,
    state,
    description,
    pathConfig.statusContext,
  );
};

export const syncValidationLabels = async (
  ctx: LabelSyncContext,
  pathConfig: PathValidationConfig,
  passed: boolean,
  hasSensitiveChanges: boolean,
): Promise<void> => {
  const { octokit, config, prNumber } = ctx;

  if (!hasSensitiveChanges) {
    await removeLabel(octokit, config.owner, config.repo, prNumber, pathConfig.labels.alert);
    await removeLabel(octokit, config.owner, config.repo, prNumber, pathConfig.labels.block);
    return;
  }

  await addLabel(
    octokit,
    config.owner,
    config.repo,
    prNumber,
    pathConfig.labels.alert,
    pathConfig.labelMeta.alert,
  );

  if (passed) {
    await removeLabel(octokit, config.owner, config.repo, prNumber, pathConfig.labels.block);
    return;
  }

  await addLabel(
    octokit,
    config.owner,
    config.repo,
    prNumber,
    pathConfig.labels.block,
    pathConfig.labelMeta.block,
  );
};
