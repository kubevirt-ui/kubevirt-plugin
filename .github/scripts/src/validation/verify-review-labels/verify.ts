import type { Octokit } from '@octokit/rest';

import { getPrLabelNames, removeLabel } from '../../github-comments';
import type { GitHubConfig } from '../../types/index';
import { AI_CONFIG } from '../ai-config-validation/constants';
import { CI_SCRIPTS_CONFIG } from '../ci-scripts-validation/constants';
import { HandledValidationError } from '../pr-path-validation/errors';
import {
  executeAiConfigValidation,
  executeCiScriptsValidation,
} from '../pr-path-validation/execute';
import {
  APPROVAL_BOT_LOGIN,
  isLabelAppliedByTrustedActor,
  isListedInOwners,
} from '../pr-path-validation/owners';

export const AI_LABELS = new Set<string>([AI_CONFIG.labels.reviewed, AI_CONFIG.labels.skip]);
export const CI_LABELS = new Set<string>([
  CI_SCRIPTS_CONFIG.labels.reviewed,
  CI_SCRIPTS_CONFIG.labels.skip,
]);

const WATCHED_LABELS = new Set<string>([...AI_LABELS, ...CI_LABELS]);

export type ValidationDispatcher = (input: {
  baseBranch: string;
  config: GitHubConfig;
  eventAction: string;
  headSha?: string;
  prNumber: number;
}) => Promise<void>;

export type VerifyReviewLabelContext = {
  baseBranch: string;
  config: GitHubConfig;
  headSha?: string;
  /** Label that triggered this `labeled` event. */
  labelName: string;
  octokit: Octokit;
  prNumber: number;
  sender: string;
};

export type VerifyReviewLabelDeps = {
  executeAiConfigValidation: ValidationDispatcher;
  executeCiScriptsValidation: ValidationDispatcher;
  /** Injectable for tests -- defaults to reading current PR labels from GitHub. */
  getPrLabelNames?: typeof getPrLabelNames;
};

const defaultDeps: VerifyReviewLabelDeps = {
  executeAiConfigValidation,
  executeCiScriptsValidation,
};

const isEventSenderTrusted = async (ctx: VerifyReviewLabelContext): Promise<boolean> => {
  // /ai-approved and /ci-approved already OWNERS-check the commenter before
  // the bot adds the label -- that labeled event's sender is the bot, so
  // without this exemption verify would strip valid bot-applied approvals.
  // Exact match only: trusting every *[bot] would let any label-write app bypass.
  if (ctx.sender === APPROVAL_BOT_LOGIN) {
    return true;
  }
  return isListedInOwners(
    ctx.octokit,
    ctx.config.owner,
    ctx.config.repo,
    ctx.baseBranch,
    ctx.sender,
  );
};

const dispatchValidation = async (
  dispatch: ValidationDispatcher,
  ctx: VerifyReviewLabelContext,
): Promise<void> => {
  try {
    await dispatch({
      baseBranch: ctx.baseBranch,
      config: ctx.config,
      eventAction: 'label-stripped',
      headSha: ctx.headSha,
      prNumber: ctx.prNumber,
    });
  } catch (err) {
    if (!(err instanceof HandledValidationError)) {
      throw err;
    }
  }
};

/**
 * Strips untrusted AI/CI review or skip labels, then re-runs matching
 * validation(s). Reconciles every watched label currently on the PR so a
 * concurrent `labeled` event cannot leave an untrusted label behind if an
 * earlier verification run is still in flight.
 */
export const verifyReviewLabel = async (
  ctx: VerifyReviewLabelContext,
  deps: VerifyReviewLabelDeps = defaultDeps,
): Promise<void> => {
  const listLabels = deps.getPrLabelNames ?? getPrLabelNames;
  const labelsToCheck: string[] = await (async (): Promise<string[]> => {
    try {
      const current = await listLabels(
        ctx.octokit,
        ctx.config.owner,
        ctx.config.repo,
        ctx.prNumber,
      );
      return [...WATCHED_LABELS].filter((name) => current.has(name));
    } catch {
      return WATCHED_LABELS.has(ctx.labelName) ? [ctx.labelName] : [];
    }
  })();

  if (labelsToCheck.length === 0) {
    console.log(
      `No watched review/skip labels present on PR #${ctx.prNumber} -- nothing to verify.`,
    );
    return;
  }

  const senderTrusted = await isEventSenderTrusted(ctx);
  const stripped = { ai: false, ci: false };

  for (const labelName of labelsToCheck) {
    const trusted =
      labelName === ctx.labelName
        ? senderTrusted
        : await isLabelAppliedByTrustedActor(
            ctx.octokit,
            ctx.config.owner,
            ctx.config.repo,
            ctx.prNumber,
            labelName,
            ctx.baseBranch,
          );

    console.log(
      trusted
        ? `"${labelName}" is trusted -- leaving in place.`
        : `"${labelName}" is not trusted -- stripping.`,
    );

    if (trusted) {
      continue;
    }

    await removeLabel(ctx.octokit, ctx.config.owner, ctx.config.repo, ctx.prNumber, labelName);
    if (AI_LABELS.has(labelName)) {
      stripped.ai = true;
    }
    if (CI_LABELS.has(labelName)) {
      stripped.ci = true;
    }
  }

  if (stripped.ai) {
    await dispatchValidation(deps.executeAiConfigValidation, ctx);
  }
  if (stripped.ci) {
    await dispatchValidation(deps.executeCiScriptsValidation, ctx);
  }
};
