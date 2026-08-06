import type { Octokit } from '@octokit/rest';

import { getPrLabelNames, removeLabel } from '../../github-comments';
import type { GitHubConfig } from '../../types/index';
import { AI_CONFIG } from '../ai-config-validation/constants';
import { CI_SCRIPTS_CONFIG } from '../ci-scripts-validation/constants';
import { I18N_CONFIG } from '../i18n-validation/constants';
import { HandledValidationError } from '../pr-path-validation/errors';
import {
  executeAiConfigValidation,
  executeCiScriptsValidation,
  executeI18nValidation,
} from '../pr-path-validation/execute';
import {
  isLabelAppliedByTrustedActor,
  isListedInOwners,
  isTrustedBot,
} from '../pr-path-validation/owners';

export const AI_LABELS = new Set<string>([AI_CONFIG.labels.reviewed, AI_CONFIG.labels.skip]);
export const CI_LABELS = new Set<string>([
  CI_SCRIPTS_CONFIG.labels.reviewed,
  CI_SCRIPTS_CONFIG.labels.skip,
]);
export const I18N_LABELS = new Set<string>([I18N_CONFIG.labels.reviewed, I18N_CONFIG.labels.skip]);

const WATCHED_LABELS = new Set<string>([...AI_LABELS, ...CI_LABELS, ...I18N_LABELS]);

export type ValidationDispatcher = (input: {
  baseBranch: string;
  config: GitHubConfig;
  eventAction: string;
  prNumber: number;
}) => Promise<void>;

export type VerifyReviewLabelContext = {
  baseBranch: string;
  config: GitHubConfig;
  /** Label that triggered this `labeled` event. */
  labelName: string;
  octokit: Octokit;
  prNumber: number;
  sender: string;
};

export type VerifyReviewLabelDeps = {
  executeAiConfigValidation: ValidationDispatcher;
  executeCiScriptsValidation: ValidationDispatcher;
  executeI18nValidation: ValidationDispatcher;
  /** Injectable for tests -- defaults to reading current PR labels from GitHub. */
  getPrLabelNames?: typeof getPrLabelNames;
};

const defaultDeps: VerifyReviewLabelDeps = {
  executeAiConfigValidation,
  executeCiScriptsValidation,
  executeI18nValidation,
};

const isEventSenderTrusted = async (ctx: VerifyReviewLabelContext): Promise<boolean> => {
  // /ai-approved, /ci-approved, and /i18n-approved already OWNERS-check the
  // commenter before the bot adds the label -- that labeled event's sender is
  // the bot, so without this exemption verify would strip valid bot-applied
  // approvals. Exact match only: trusting every *[bot] would let any
  // label-write app bypass.
  if (isTrustedBot(ctx.sender)) {
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
      prNumber: ctx.prNumber,
    });
  } catch (err) {
    if (!(err instanceof HandledValidationError)) {
      throw err;
    }
  }
};

/**
 * Strips untrusted AI/CI/i18n review or skip labels, then re-runs matching
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

    if (!trusted) {
      await removeLabel(ctx.octokit, ctx.config.owner, ctx.config.repo, ctx.prNumber, labelName);
    }
  }

  // Always re-run all path validations — they compute pass/fail from current
  // label state. Whether labels were stripped or left in place, the commit
  // status should reflect the latest truth.
  await dispatchValidation(deps.executeAiConfigValidation, ctx);
  await dispatchValidation(deps.executeCiScriptsValidation, ctx);
  await dispatchValidation(deps.executeI18nValidation, ctx);
};
