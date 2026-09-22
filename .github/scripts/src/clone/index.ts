import { upsertComment } from '../github-comments';
import { createOctokit } from '../github-repo';
import { JiraClient } from '../jira-client';
import { requireEnv, safeErrorMessage } from '../utils';

import { failStep } from '../shared/output';
import type { CherryPickResult, GitHubConfig } from '../types/index';
import { JIRA_BASE_URL, JIRA_PROJECT_KEY } from '../types/index';
import { openCherryPickPR, performCherryPick } from './cherry-pick';
import { buildSourcePrCloneSuccessComment } from './clone-comments';
import { formatCloneFailureMessage } from './clone-errors';
import { cloneAllTickets } from './clone-tickets';
import { postCloneError, validateCloneCommand } from './clone-validation';
import { setupRepositoryForCherryPick } from './git-helpers';

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

  const primaryClone = clonedTickets[0];
  const cherryPickBranch = `cherry-pick-${primaryClone.clonedKey.toLowerCase()}-to-${targetBranch}`;
  const commitSha = mergeCommitSha || headSha;

  let result: CherryPickResult;
  try {
    setupRepositoryForCherryPick({
      commitSha,
      owner: ghConfig.owner,
      repo: ghConfig.repo,
      targetBranch,
      token: ghConfig.token,
    });

    result = performCherryPick(targetBranch, commitSha, cherryPickBranch, clonedTickets);
  } catch (err) {
    await postCloneError(
      octokit,
      ghConfig,
      prNumber,
      formatCloneFailureMessage('Cherry-pick failed', err),
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
      formatCloneFailureMessage('Failed to open cherry-pick PR', err),
    );
    return failStep(`Failed to open cherry-pick PR: ${safeErrorMessage(err)}`);
  }

  const comment = buildSourcePrCloneSuccessComment({
    cherryPickClean: result.cherryPickClean,
    conflictDetails: result.conflictDetails,
    newPrUrl: newPr.html_url,
    targetBranch,
  });

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
