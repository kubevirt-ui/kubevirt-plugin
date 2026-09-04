import { upsertComment } from '../github-comments';
import { createOctokit } from '../github-repo';
import { JiraClient } from '../jira-client';
import { requireEnv, safeErrorMessage } from '../utils';

import { failStep } from '../shared/output';
import type { CherryPickResult, GitHubConfig } from '../types/index';
import { JIRA_BASE_URL, JIRA_PROJECT_KEY } from '../types/index';
import { openCherryPickPR, performCherryPick } from './cherry-pick';
import { formatCloneFailureMessage } from './clone-errors';
import { cloneAllTickets } from './clone-tickets';
import { postCloneError, validateCloneCommand } from './clone-validation';

const clonedTicketsFooter = (clonedKeys: string[]): string =>
  clonedKeys.length > 0
    ? `Cloned tickets: ${clonedKeys.map((key) => `[${key}](${JIRA_BASE_URL}/browse/${key})`).join(', ')}`
    : '';

/** Parse /clone command, clone Jira tickets, cherry-pick, and open a new PR. */
export const runClone = async (): Promise<void> => {
  const ghConfig: GitHubConfig = {
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
    token: requireEnv('GITHUB_TOKEN'),
  };

  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const prTitle = requireEnv('PR_TITLE');
  const headSha = requireEnv('HEAD_SHA');
  const mergeCommitSha = process.env['MERGE_COMMIT_SHA'] ?? '';
  const commentBody = requireEnv('COMMENT_BODY');
  const commentAuthorAssociation = requireEnv('COMMENT_AUTHOR_ASSOCIATION');
  const octokit = createOctokit(ghConfig);

  const jira = new JiraClient({
    baseUrl: JIRA_BASE_URL,
    projectKey: JIRA_PROJECT_KEY,
    token: requireEnv('JIRA_TOKEN'),
  });

  const validated = await validateCloneCommand(
    octokit,
    jira,
    ghConfig,
    prNumber,
    prTitle,
    commentBody,
    commentAuthorAssociation,
  );
  if (!validated) {
    return;
  }

  const { matchedVersion, targetBranch, ticketIds } = validated;

  const repoFullName = `${ghConfig.owner}/${ghConfig.repo}`;
  const clonedTickets = await cloneAllTickets(
    jira,
    ticketIds,
    matchedVersion.id,
    targetBranch,
    prNumber,
    repoFullName,
  );
  if (clonedTickets.length === 0) {
    await postCloneError(
      octokit,
      ghConfig,
      prNumber,
      `Failed to clone any tickets: ${ticketIds.join(', ')}`,
    );
    failStep(`Failed to clone any tickets: ${ticketIds.join(', ')}`);
  }

  const clonedKeys = clonedTickets.map((ticket) => ticket.clonedKey);
  const clonedFooter = clonedTicketsFooter(clonedKeys);
  const primaryClone = clonedTickets[0];
  const cherryPickBranch = `cherry-pick-${primaryClone.clonedKey.toLowerCase()}-to-${targetBranch}`;
  const commitSha = mergeCommitSha || headSha;

  let result: CherryPickResult;
  try {
    result = performCherryPick(targetBranch, commitSha, cherryPickBranch, clonedTickets);
  } catch (err) {
    await postCloneError(
      octokit,
      ghConfig,
      prNumber,
      formatCloneFailureMessage('Cherry-pick failed', err, clonedFooter),
    );
    return failStep(`Cherry-pick failed: ${safeErrorMessage(err)}`);
  }

  const originalSummary = prTitle.replace(/^(?:\[.*?\]\s*)?(?:CNV-\d+\s*)+:\s*/i, '').trim();
  const newPrTitle = `[${targetBranch}] ${clonedTickets
    .map((ticket) => ticket.clonedKey)
    .join(' ')}: ${originalSummary}`;

  let newPr: { html_url: string; number: number };
  try {
    newPr = await openCherryPickPR(octokit, ghConfig.owner, ghConfig.repo, {
      cherryPickBranch: result.cherryPickBranch,
      cherryPickClean: result.cherryPickClean,
      clonedTickets,
      conflictDetails: result.conflictDetails,
      matchedVersion,
      originalPrNumber: prNumber,
      prTitle: newPrTitle,
      targetBranch,
    });
  } catch (err) {
    await postCloneError(
      octokit,
      ghConfig,
      prNumber,
      formatCloneFailureMessage('Failed to open cherry-pick PR', err, clonedFooter),
    );
    return failStep(`Failed to open cherry-pick PR: ${safeErrorMessage(err)}`);
  }

  const statusIcon = result.cherryPickClean ? ':white_check_mark:' : ':warning:';
  const draftNote = result.cherryPickClean ? '' : ' (opened as **draft**)';
  const conflictNote = result.cherryPickClean
    ? 'Clean'
    : `Conflicts — see PR and resolve manually:\n\`\`\`\n${result.conflictDetails}\n\`\`\``;
  const rows = clonedTickets.map(
    (ticket) =>
      `| ${ticket.originalKey} → ${ticket.clonedKey} | [${ticket.clonedKey}](${JIRA_BASE_URL}/browse/${ticket.clonedKey}) |`,
  );

  const comment = [
    `${statusIcon} **Clone to \`${targetBranch}\` complete**${draftNote}`,
    '',
    '| Ticket mapping | Link |',
    '|----------------|------|',
    ...rows,
    '',
    '| | |',
    '|---|---|',
    `| **Fix version** | ${matchedVersion.name} |`,
    `| **New PR** | #${newPr.number} |`,
    `| **Cherry-pick** | ${conflictNote} |`,
  ].join('\n');

  await upsertComment(
    octokit,
    ghConfig.owner,
    ghConfig.repo,
    prNumber,
    `<!-- jira-clone:${targetBranch} -->`,
    comment,
  );
  console.log(`Done. New PR: ${newPr.html_url}`);
};
