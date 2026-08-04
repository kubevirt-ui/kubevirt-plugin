import type { Octokit } from '@octokit/rest';

import { addLabel, removeLabel } from '../../github-comments';
import type { GitHubConfig } from '../../types/index';
import type { PathValidationConfig } from './types';

export type PathValidationEvent = {
  action?: string;
};

export type LabelSyncContext = {
  config: GitHubConfig;
  octokit: Octokit;
  prNumber: number;
};

export const syncValidationLabels = async (
  ctx: LabelSyncContext,
  pathConfig: PathValidationConfig,
  passed: boolean,
  hasSensitiveChanges: boolean,
): Promise<void> => {
  const { config, octokit, prNumber } = ctx;

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
