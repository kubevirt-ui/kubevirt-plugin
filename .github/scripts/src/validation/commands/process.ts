/* eslint-disable no-console */
import { isApprovalAuthError } from './approve';
import { HandledValidationError } from '../pr-path-validation/errors';
import { reportAiConfigError, reportCiScriptsError } from '../pr-path-validation/execute';
import { setCommitStatus } from '../../github-comments';
import { createStatusOctokit } from '../../github-repo';
import { safeErrorMessage } from '../../utils';
import type { ValidationCommand } from './parse-command';
import type { GitHubConfig } from '../../types/index';

export type CommandOutcome = { command: ValidationCommand; error?: unknown };
export type CommandHandlers = Record<ValidationCommand, () => Promise<void>>;

/** Runs each command's handler in isolation -- one command's failure never stops the rest from running. */
export const processCommands = async (
  commands: ValidationCommand[],
  handlers: CommandHandlers,
): Promise<CommandOutcome[]> => {
  const outcomes: CommandOutcome[] = [];
  for (const command of commands) {
    try {
      await handlers[command]();
      outcomes.push({ command });
    } catch (error) {
      outcomes.push({ command, error });
    }
  }
  return outcomes;
};

/**
 * True when a failed command's error should still be reported via a generic
 * fallback status/label. False when the handler already reported a specific
 * status before throwing (HandledValidationError) -- overwriting that with a
 * generic "unexpected error" message would hide the real, useful reason.
 */
export const shouldReportGenericFailure = (error: unknown): boolean =>
  !(error instanceof HandledValidationError);

export type ReportCommandFailureDeps = {
  reportAiConfigError: typeof reportAiConfigError;
  reportCiScriptsError: typeof reportCiScriptsError;
};

const defaultReportDeps: ReportCommandFailureDeps = { reportAiConfigError, reportCiScriptsError };

/** Reports the failure of a single command via its own status/label channel. Assumes the handler already reported anything reportable before throwing. */
export const reportCommandFailure = async (
  outcome: Required<CommandOutcome>,
  config: GitHubConfig,
  headSha: string | undefined,
  deps: ReportCommandFailureDeps = defaultReportDeps,
): Promise<void> => {
  const { command, error } = outcome;
  console.error(`${command} failed: ${safeErrorMessage(error)}`);

  if (!shouldReportGenericFailure(error)) {
    // The handler already reported a specific status/label before throwing
    // (e.g. executeJiraValidation's "No CNV ticket ID found") -- don't
    // overwrite it with a generic "unexpected error" message.
    return;
  }

  if (command === 'recheck-jira' && headSha) {
    try {
      await setCommitStatus(
        createStatusOctokit(config),
        config.owner,
        config.repo,
        headSha,
        'error',
        'Jira validation encountered an unexpected error',
      );
    } catch {
      // best-effort
    }
    return;
  }

  // Best-effort, like the recheck-jira branch above -- a rejection here must
  // not escape to index.ts's top-level catch, which would re-derive every
  // requested command from COMMENT_BODY and re-report this one even if it
  // already succeeded.
  if (command === 'ai-approved' && !isApprovalAuthError(error, '/ai-approved')) {
    try {
      await deps.reportAiConfigError(config, headSha, error);
    } catch (reportErr) {
      console.error(
        `ai-approved failed to report its own unexpected error: ${safeErrorMessage(reportErr)}`,
      );
    }
  }

  if (command === 'ci-approved' && !isApprovalAuthError(error, '/ci-approved')) {
    try {
      await deps.reportCiScriptsError(config, headSha, error);
    } catch (reportErr) {
      console.error(
        `ci-approved failed to report its own unexpected error: ${safeErrorMessage(reportErr)}`,
      );
    }
  }
};
