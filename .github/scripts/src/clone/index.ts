import { upsertComment } from '../github-comments';
import { createOctokit } from '../github-repo';
import { JiraClient } from '../jira-client';
import { requireEnv } from '../utils';

import { failStep } from '../shared/output';
import type { CherryPickResult, GitHubConfig } from '../types/index';
import { JIRA_BASE_URL, JIRA_PROJECT_KEY } from '../types/index';
import { openCherryPickPR, performCherryPick } from './cherry-pick';
import { cloneAllTickets } from './clone-tickets';
import { postCloneError, validateCloneCommand } from './clone-validation';

/** Entrypoint: parse /clone command, clone Jira tickets, cherry-pick, and open a new PR. */
const main = async (): Promise<void> => {
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

  const primaryClone = clonedTickets[0];
  const cherryPickBranch = `cherry-pick-${primaryClone.clonedKey.toLowerCase()}-to-${targetBranch}`;
  const commitSha = mergeCommitSha || headSha;

  const result = await (async (): Promise<CherryPickResult> => {
    try {
      return performCherryPick(targetBranch, commitSha, cherryPickBranch, clonedTickets);
    } catch (err) {
      const keys = clonedTickets
        .map((ticket) => `[${ticket.clonedKey}](${JIRA_BASE_URL}/browse/${ticket.clonedKey})`)
        .join(', ');
      await postCloneError(
        octokit,
        ghConfig,
        prNumber,
        `Cherry-pick failed.\n\nCloned tickets: ${keys}`,
      );
      failStep('Cherry-pick failed');
      throw err;
    }
  })();

  const originalSummary = prTitle.replace(/^(?:\[.*?\]\s*)?(?:CNV-\d+\s*)+:\s*/i, '').trim();
  const newPrTitle = `[${targetBranch}] ${clonedTickets
    .map((ticket) => ticket.clonedKey)
    .join(' ')}: ${originalSummary}`;

  const newPr = await openCherryPickPR(octokit, ghConfig.owner, ghConfig.repo, {
    cherryPickBranch: result.cherryPickBranch,
    cherryPickClean: result.cherryPickClean,
    clonedTickets,
    conflictDetails: result.conflictDetails,
    matchedVersion,
    originalPrNumber: prNumber,
    prTitle: newPrTitle,
    targetBranch,
  });

  const statusIcon = result.cherryPickClean ? ':white_check_mark:' : ':warning:';
  const draftNote = result.cherryPickClean ? '' : ' (opened as **draft**)';
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
    `| **Cherry-pick** | ${result.cherryPickClean ? 'Clean' : 'Conflicts (see PR)'} |`,
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

void main().catch((err) => {
  failStep(err instanceof Error ? err.message : 'Unexpected error');
});
