import type { Octokit } from '@octokit/rest';

import { syncValidationLabels } from './label-sync';
import type { LabelSyncContext, PathValidationEvent } from './label-sync';
import { isLabelAppliedByTrustedActor } from './owners';
import { getSensitivePaths } from './paths';
import { getPrLabelNames, removeLabel } from '../../github-comments';
import { getPullRequestFiles } from '../../github-repo';
import type { GitHubConfig } from '../../types/index';
import type { PathValidationConfig } from './types';

export type PathValidationContext = {
  octokit: Octokit;
  statusOctokit?: Octokit;
  config: GitHubConfig;
  prNumber: number;
  headSha?: string;
  event: PathValidationEvent;
  /** Needed to verify the skip label's applier against OWNERS at the PR's real target branch -- never the PR's own branch. */
  baseBranch: string;
  /** Pre-fetched changed files -- skips the internal getPullRequestFiles call so callers running multiple path validations for the same PR can share one fetch. */
  files?: Array<{ filename: string; patch?: string }>;
};

export type PathValidationOutcome =
  | { kind: 'skipped' }
  | { kind: 'passed' | 'failed'; sensitivePaths: string[] };

export type BuildStatusDescription = (passed: boolean, hasSensitiveChanges: boolean) => string;

/**
 * Run generic path-based sensitive-change validation for a pull request:
 * pending status -> fetch changed files -> compute sensitivity ->
 * skip-label short-circuit -> clear skip/reviewed on synchronize -> compute
 * passed -> sync labels -> final status. ai-config-validation and
 * ci-scripts-validation are both thin wrappers around this.
 */
export const runPathValidation = async (
  ctx: PathValidationContext,
  pathConfig: PathValidationConfig,
  buildStatusDescription: BuildStatusDescription,
  onFilesFetched?: (files: Array<{ filename: string; patch?: string }>) => void,
): Promise<PathValidationOutcome> => {
  const labelCtx: LabelSyncContext = {
    octokit: ctx.octokit,
    config: ctx.config,
    prNumber: ctx.prNumber,
  };

  const files =
    ctx.files ??
    (await getPullRequestFiles(ctx.octokit, ctx.config.owner, ctx.config.repo, ctx.prNumber));
  const sensitivePaths = getSensitivePaths(
    files.map((file) => file.filename),
    pathConfig,
  );
  const hasSensitiveChanges = sensitivePaths.length > 0;

  onFilesFetched?.(files);

  const prLabels = await getPrLabelNames(
    ctx.octokit,
    ctx.config.owner,
    ctx.config.repo,
    ctx.prNumber,
  );

  // statusOctokit (ambient token) for OWNERS / timeline reads -- the bot
  // app token lacks contents:read. Fall back to octokit when only one client
  // was supplied.
  const ownersOctokit = ctx.statusOctokit ?? ctx.octokit;

  // A prior skip/reviewed must not survive a new push of sensitive changes
  // -- clear both before the skip short-circuit so the bypass can't be reused.
  // A maintainer can re-apply skip afterward; isLabelAppliedByTrustedActor
  // still enforces that any remaining/new skip is trusted.
  if (hasSensitiveChanges && ctx.event.action === 'synchronize') {
    if (prLabels.has(pathConfig.labels.skip)) {
      await removeLabel(
        ctx.octokit,
        ctx.config.owner,
        ctx.config.repo,
        ctx.prNumber,
        pathConfig.labels.skip,
      );
      prLabels.delete(pathConfig.labels.skip);
    }
    if (prLabels.has(pathConfig.labels.reviewed)) {
      await removeLabel(
        ctx.octokit,
        ctx.config.owner,
        ctx.config.repo,
        ctx.prNumber,
        pathConfig.labels.reviewed,
      );
      prLabels.delete(pathConfig.labels.reviewed);
    }
  }

  if (
    hasSensitiveChanges &&
    prLabels.has(pathConfig.labels.skip) &&
    (await isLabelAppliedByTrustedActor(
      ownersOctokit,
      ctx.config.owner,
      ctx.config.repo,
      ctx.prNumber,
      pathConfig.labels.skip,
      ctx.baseBranch,
    ))
  ) {
    // Clear alert/block too -- otherwise "do-not-merge/*-review" stays
    // applied even though the status now reports success.
    await syncValidationLabels(labelCtx, pathConfig, true, hasSensitiveChanges);
    return { kind: 'skipped' };
  }

  const reviewed = prLabels.has(pathConfig.labels.reviewed);
  const passed = !hasSensitiveChanges || reviewed;

  await syncValidationLabels(labelCtx, pathConfig, passed, hasSensitiveChanges);

  return {
    kind: passed ? 'passed' : 'failed',
    sensitivePaths,
  };
};
