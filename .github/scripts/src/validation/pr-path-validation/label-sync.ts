import type { Octokit } from '@octokit/rest';

import { addLabel, removeLabel, setCommitStatus } from '../../github-comments';
import type { GitHubConfig } from '../../types/index';
import type { PathValidationConfig } from './types';

export type PathValidationEvent = {
  action?: string;
};

export type LabelSyncContext = {
  octokit: Octokit;
  /** Commit statuses / check-runs need a separate permission scope -- defaults to `octokit` when the caller has just one token. */
  statusOctokit?: Octokit;
  config: GitHubConfig;
  prNumber: number;
  headSha?: string;
  /** Holds the check-run id created by the first publishCheckRun call in this run, so later calls update it in place instead of creating a new one. */
  checkRunId?: { current?: number };
};

const STATUS_TO_CHECK_STATE: Record<
  'pending' | 'success' | 'failure' | 'error',
  { status: 'in_progress' | 'completed'; conclusion?: 'success' | 'failure' | 'neutral' }
> = {
  pending: { status: 'in_progress' },
  success: { status: 'completed', conclusion: 'success' },
  failure: { status: 'completed', conclusion: 'failure' },
  // 'neutral' does not block merging on GitHub -- an unexpected error must
  // fail closed the same as a real failure, not silently pass the check.
  error: { status: 'completed', conclusion: 'failure' },
};

/**
 * Explicitly create/update a check-run for this validation, rather than
 * relying on whatever incidental check-run the surrounding job's own name
 * produces (which a future job rename could orphan). Same pattern as
 * publish-gating-check for "Run Gating Tests". Best-effort: the plain
 * status still reports the result even if this call fails.
 */
export const publishCheckRun = async (
  ctx: LabelSyncContext,
  pathConfig: Pick<PathValidationConfig, 'statusContext'>,
  state: 'pending' | 'success' | 'failure' | 'error',
  title: string,
  summary: string,
): Promise<void> => {
  if (!ctx.headSha) return;

  const octokit = ctx.statusOctokit ?? ctx.octokit;
  const { status, conclusion } = STATUS_TO_CHECK_STATE[state];
  const headSha = ctx.headSha;

  const output = { summary, title };
  const completedAt = status === 'completed' ? new Date().toISOString() : undefined;

  try {
    const existingId = ctx.checkRunId?.current;
    if (existingId) {
      await octokit.checks.update({
        check_run_id: existingId,
        completed_at: completedAt,
        conclusion,
        output,
        owner: ctx.config.owner,
        repo: ctx.config.repo,
        status,
      });
      return;
    }

    const { data } = await octokit.checks.create({
      completed_at: completedAt,
      conclusion,
      head_sha: headSha,
      name: pathConfig.statusContext,
      output,
      owner: ctx.config.owner,
      repo: ctx.config.repo,
      status,
    });
    if (ctx.checkRunId) {
      ctx.checkRunId.current = data.id;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `Could not publish "${pathConfig.statusContext}" check-run: ${(err as Error)?.message ?? err}`,
    );
  }
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
  await publishCheckRun(ctx, pathConfig, state, pathConfig.displayName, description);
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
