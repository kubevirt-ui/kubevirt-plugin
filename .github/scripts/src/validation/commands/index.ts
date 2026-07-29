import { createOctokit, createStatusOctokit } from '../../github-repo';
import type { GitHubConfig } from '../../types/index';
import { requireEnv, safeErrorMessage } from '../../utils';
import { AI_CONFIG_EVENT_ACTIONS } from '../ai-config-validation/constants';
import { executeJiraValidation } from '../jira-validation/execute';
import {
  executeAiConfigValidation,
  executeCiScriptsValidation,
} from '../pr-path-validation/execute';
import type { ApprovalContext } from './approve';
import { applyApprove, approveAiConfig, approveCiScripts, cancelApprove } from './approve';
import { applyHold, cancelHold } from './hold';
import type { ReviewContext } from './lgtm';
import { applyLgtm, cancelLgtm } from './lgtm';
import { parseCommand } from './parse-command';
import type { CommandHandlers, CommandOutcome } from './process';
import { processCommands, reportCommandFailure } from './process';

const main = async (): Promise<void> => {
  const commands = parseCommand(requireEnv('COMMENT_BODY'));

  const config: GitHubConfig = {
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
    statusToken: process.env.STATUS_GITHUB_TOKEN,
    token: requireEnv('GITHUB_TOKEN'),
  };

  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const prTitle = requireEnv('PR_TITLE');
  const baseBranch = requireEnv('BASE_BRANCH');
  const headSha = process.env.PR_HEAD_SHA;
  const author = requireEnv('COMMENT_AUTHOR');
  const commentId = parseInt(requireEnv('COMMENT_ID'), 10);
  const prAuthor = requireEnv('PR_AUTHOR');

  const approvalCtx: ApprovalContext = {
    author,
    baseBranch,
    commentId,
    contentsOctokit: createStatusOctokit(config),
    octokit: createOctokit(config),
    owner: config.owner,
    prAuthor,
    prNumber,
    repo: config.repo,
  };
  const reviewCtx: ReviewContext = approvalCtx;

  const aiApproved = async (): Promise<void> => {
    await approveAiConfig(approvalCtx);
    await executeAiConfigValidation({
      baseBranch,
      config,
      eventAction: AI_CONFIG_EVENT_ACTIONS.AI_APPROVED,
      headSha,
      prNumber,
    });
  };
  const ciApproved = async (): Promise<void> => {
    await approveCiScripts(approvalCtx);
    await executeCiScriptsValidation({
      baseBranch,
      config,
      eventAction: 'ci-approved',
      headSha,
      prNumber,
    });
  };
  const recheckJira = async (): Promise<void> => {
    await executeJiraValidation({ baseBranch, config, headSha, prNumber, prTitle });
  };
  const handlers: CommandHandlers = {
    ['ai-approved']: aiApproved,
    approve: async (): Promise<void> => applyApprove(approvalCtx),
    ['approve-cancel']: async (): Promise<void> => cancelApprove(approvalCtx),
    ['ci-approved']: ciApproved,
    hold: async (): Promise<void> => applyHold(approvalCtx),
    ['hold-cancel']: async (): Promise<void> => cancelHold(approvalCtx),
    lgtm: async (): Promise<void> => applyLgtm(reviewCtx),
    ['lgtm-cancel']: async (): Promise<void> => cancelLgtm(reviewCtx),
    ['recheck-jira']: recheckJira,
  };

  // A comment can contain more than one command (e.g. "/ai-approved
  // /ci-approved") -- each runs and is reported on independently.
  const outcomes = await processCommands(commands, handlers);
  const failures = outcomes.filter(
    (outcome): outcome is Required<CommandOutcome> => outcome.error !== undefined,
  );

  for (const failure of failures) {
    await reportCommandFailure(failure, config, headSha);
  }

  if (failures.length > 0) {
    process.exit(1);
  }
};

void main().catch(async (err) => {
  console.error(safeErrorMessage(err));

  // Reaching here means something failed *before* the per-command loop even
  // started (e.g. requireEnv('GITHUB_TOKEN') throwing because a bot-token
  // generation step failed) -- nothing has been reported yet. Best-effort
  // report it against every requested command via the ambient/status token,
  // which doesn't depend on the credential that just failed.
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const statusToken = process.env.STATUS_GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;

  if (owner && repo && statusToken) {
    const commands = parseCommand(process.env.COMMENT_BODY ?? '');
    const config: GitHubConfig = { owner, repo, token: statusToken };
    for (const command of commands) {
      await reportCommandFailure({ command, error: err }, config, process.env.PR_HEAD_SHA);
    }
  }

  process.exit(1);
});
