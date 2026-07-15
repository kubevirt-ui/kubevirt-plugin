/* eslint-disable no-console */
import { executeAiConfigValidation, reportAiConfigError } from '../ai-config-validation/execute';
import { HandledValidationError } from '../ai-config-validation/errors';
import { AI_CONFIG } from '../ai-config-validation/constants';
import { addLabel, setCommitStatus } from '../github-comments';
import { createOctokit } from '../github-repo';
import { executeJiraValidation } from '../jira-validation/execute';
import { isListedInAiConfigOwners } from './owners';
import { parseCommand } from './parse-command';
import { requireEnv, safeErrorMessage } from '../utils';
import type { GitHubConfig } from '../types/index';

const reactToComment = async (
  octokit: ReturnType<typeof createOctokit>,
  owner: string,
  repo: string,
  commentId: number,
  content: '+1' | '-1',
): Promise<void> => {
  try {
    await octokit.reactions.createForIssueComment({
      owner,
      repo,
      comment_id: commentId,
      content,
    });
  } catch (err) {
    console.warn(`Could not react to comment: ${safeErrorMessage(err)}`);
  }
};

const approveAiConfig = async (
  config: GitHubConfig,
  prNumber: number,
  baseBranch: string,
  author: string,
  commentId: number,
): Promise<void> => {
  const octokit = createOctokit(config);
  const trusted = await isListedInAiConfigOwners(
    octokit,
    config.owner,
    config.repo,
    baseBranch,
    author,
  );

  console.log(
    `${author} is ${trusted ? '' : 'not '}listed in .github/OWNERS (AI-config approvers) — ${trusted ? 'trusted' : 'untrusted, ignoring /ai-approved'}.`,
  );

  if (!trusted) {
    await reactToComment(octokit, config.owner, config.repo, commentId, '-1');
    throw new Error(`${author} is not authorized to use /ai-approved`);
  }

  await addLabel(octokit, config.owner, config.repo, prNumber, AI_CONFIG.LABELS.REVIEWED, {
    color: '0e8a16',
    description: 'AI/editor configuration security review completed',
  });
  await reactToComment(octokit, config.owner, config.repo, commentId, '+1');
  console.log(`Added ${AI_CONFIG.LABELS.REVIEWED} label to PR #${prNumber}.`);
};

const isAiApprovedAuthError = (err: unknown): boolean =>
  err instanceof Error && err.message.includes('not authorized to use /ai-approved');

const main = async (): Promise<void> => {
  const command = parseCommand(requireEnv('COMMENT_BODY'));

  const config: GitHubConfig = {
    token: requireEnv('GITHUB_TOKEN'),
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
  };

  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const prTitle = requireEnv('PR_TITLE');
  const baseBranch = requireEnv('BASE_BRANCH');
  const headSha = process.env.PR_HEAD_SHA;
  const author = requireEnv('COMMENT_AUTHOR');
  const commentId = parseInt(requireEnv('COMMENT_ID'), 10);

  if (command === 'ai-approved') {
    await approveAiConfig(config, prNumber, baseBranch, author, commentId);
    await executeAiConfigValidation({
      config,
      eventAction: AI_CONFIG.EVENT_ACTIONS.AI_APPROVED,
      headSha,
      prNumber,
    });
    return;
  }

  if (command === 'recheck-jira') {
    await executeJiraValidation({
      baseBranch,
      config,
      headSha,
      prNumber,
      prTitle,
    });
  }
};

main().catch(async (err) => {
  console.error(safeErrorMessage(err));

  const command = parseCommand(process.env.COMMENT_BODY ?? '');
  const config: GitHubConfig = {
    token: process.env.GITHUB_TOKEN ?? '',
    owner: process.env.REPO_OWNER ?? '',
    repo: process.env.REPO_NAME ?? '',
  };
  const headSha = process.env.PR_HEAD_SHA;

  if (command === 'recheck-jira' && headSha) {
    try {
      const octokit = createOctokit(config);
      await setCommitStatus(
        octokit,
        config.owner,
        config.repo,
        headSha,
        'error',
        'Jira validation encountered an unexpected error',
      );
    } catch {
      // best-effort
    }
  }

  if (
    command === 'ai-approved' &&
    !isAiApprovedAuthError(err) &&
    !(err instanceof HandledValidationError)
  ) {
    await reportAiConfigError(config, headSha, err);
  }

  process.exit(1);
});
