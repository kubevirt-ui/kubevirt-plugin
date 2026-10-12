import type { Octokit } from '@octokit/rest';

import { upsertComment } from '../github-comments';
import { branchExists } from '../github-repo';
import { type JiraClient } from '../jira-client';
import { extractVersionFromBranch, findMatchingFixVersion } from '../version-compare';
import { extractTicketIds } from '../version-parse';

import type { GitHubConfig, JiraVersion } from '../types/index';
import { CLONE_COMMENT_MARKER, JIRA_PROJECT_KEY } from '../types/index';

const ALLOWED_ASSOCIATIONS = new Set(['MEMBER', 'OWNER', 'COLLABORATOR']);
const CLONE_CMD_REGEX = /^\/clone\s+(release-\d+\.\d+)\s*$/m;

export type ValidatedCloneCommand = {
  matchedVersion: JiraVersion;
  targetBranch: string;
  ticketIds: string[];
};

/** Post a clone failure message as an idempotent PR comment. */
export const postCloneError = async (
  octokit: Octokit,
  ghConfig: GitHubConfig,
  prNumber: number,
  message: string,
): Promise<void> => {
  await upsertComment(
    octokit,
    ghConfig.owner,
    ghConfig.repo,
    prNumber,
    CLONE_COMMENT_MARKER,
    `:x: **Clone failed**\n\n${message}`,
  );
};

/** Parse /clone command, validate branch and tickets, return validated context or null. */
export const validateCloneCommand = async (
  octokit: Octokit,
  jira: JiraClient,
  ghConfig: GitHubConfig,
  prNumber: number,
  prTitle: string,
  commentBody: string,
  commentAuthorAssociation: string,
): Promise<null | ValidatedCloneCommand> => {
  if (!ALLOWED_ASSOCIATIONS.has(commentAuthorAssociation)) {
    await postCloneError(
      octokit,
      ghConfig,
      prNumber,
      'You do not have write access to use `/clone`.',
    );
    return null;
  }

  const cmdMatch = CLONE_CMD_REGEX.exec(commentBody);
  if (!cmdMatch) return null;

  const targetBranch = cmdMatch[1] ?? '';
  const targetVersion = extractVersionFromBranch(targetBranch);
  if (!targetVersion) {
    await postCloneError(octokit, ghConfig, prNumber, `Invalid branch: \`${targetBranch}\``);
    return null;
  }

  if (!(await branchExists(octokit, ghConfig.owner, ghConfig.repo, targetBranch))) {
    await postCloneError(octokit, ghConfig, prNumber, `Branch \`${targetBranch}\` does not exist.`);
    return null;
  }

  const ticketIds = extractTicketIds(prTitle);
  if (ticketIds.length === 0) {
    await postCloneError(octokit, ghConfig, prNumber, 'No `CNV-XXXXX` found in title.');
    return null;
  }

  const projectVersions = await jira.getProjectVersions(JIRA_PROJECT_KEY);
  const matchedVersion = findMatchingFixVersion(projectVersions, targetVersion);
  if (!matchedVersion) {
    const available = projectVersions
      .filter((ver) => !ver.archived)
      .map((ver) => ver.name)
      .join(', ');
    await postCloneError(
      octokit,
      ghConfig,
      prNumber,
      `No fix version for \`${targetVersion}\`.\n\nAvailable: ${available}`,
    );
    return null;
  }

  return { matchedVersion, targetBranch, ticketIds };
};
