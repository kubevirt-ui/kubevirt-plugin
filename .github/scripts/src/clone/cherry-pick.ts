import { execFileSync } from 'node:child_process';
import { Octokit } from '@octokit/rest';

import { addLabel } from '../github-comments.js';
import { createPullRequest } from '../github-repo.js';
import { rewriteJiraKeysInText, stripOriginalJiraKeys } from '../version-utils.js';
import { CONFLICT_LABEL, JIRA_BASE_URL } from '../types/index.js';
import type { CherryPickResult, ClonedTicket, JiraVersion } from '../types/index.js';

/** Run a git command via execFileSync, returning trimmed stdout. */
const git = (...args: string[]): string =>
  execFileSync('git', args, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();

/** Run a git command, returning empty string on failure. */
const gitSafe = (...args: string[]): string => {
  try {
    return git(...args);
  } catch {
    return '';
  }
};

/** Amend the latest commit message, preserving multi-line bodies. */
const amendCommitMessage = (message: string): void => {
  execFileSync('git', ['commit', '--amend', '-F', '-'], {
    encoding: 'utf-8',
    input: message,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
};

/** Cherry-pick a commit onto a target branch; aborts cleanly on conflicts. */
export const performCherryPick = (
  targetBranch: string,
  commitSha: string,
  branchName: string,
  clonedTickets: ClonedTicket[],
): CherryPickResult => {
  let cherryPickClean = true;
  let conflictDetails = '';

  git('fetch', 'origin', targetBranch);
  git('checkout', '-b', branchName, `origin/${targetBranch}`);

  try {
    git('cherry-pick', commitSha, '-m', '1', '--allow-empty');

    if (clonedTickets.length > 0) {
      const originalMessage = git('log', '-1', '--format=%B');
      const rewrittenMessage = rewriteJiraKeysInText(originalMessage, clonedTickets);
      if (rewrittenMessage !== originalMessage) {
        amendCommitMessage(rewrittenMessage);
      }
    }
  } catch {
    cherryPickClean = false;
    conflictDetails = gitSafe('diff', '--name-only', '--diff-filter=U');
    git('cherry-pick', '--abort');
    git(
      'commit',
      '--allow-empty',
      '-m',
      `[CONFLICTS] Cherry-pick ${commitSha} to ${targetBranch} - manual resolution required`,
    );
  }

  git('push', 'origin', branchName);

  return { cherryPickClean, conflictDetails, cherryPickBranch: branchName };
};

/** Build PR body with clone ticket references only (no original Jira keys). */
export const buildCherryPickPrBody = (params: {
  originalPrNumber: number;
  targetBranch: string;
  matchedVersion: JiraVersion;
  clonedTickets: ClonedTicket[];
  cherryPickClean: boolean;
  conflictDetails: string;
}): string => {
  const { originalPrNumber, targetBranch, matchedVersion, clonedTickets, cherryPickClean, conflictDetails } =
    params;

  const jiraLines = clonedTickets.map(
    (ct) => `- [${ct.clonedKey}](${JIRA_BASE_URL}/browse/${ct.clonedKey})`,
  );

  const statusLine = cherryPickClean
    ? ':white_check_mark: Cherry-pick applied cleanly.'
    : `:warning: **Cherry-pick had conflicts.** Files needing resolution:\n\`\`\`\n${conflictDetails}\n\`\`\``;

  const body = [
    `## Cherry-pick to \`${targetBranch}\``,
    '',
    `**Source PR**: #${originalPrNumber}`,
    `**Fix version**: ${matchedVersion.name}`,
    '',
    '### Jira',
    ...jiraLines,
    '',
    statusLine,
  ].join('\n');

  return stripOriginalJiraKeys(body, clonedTickets);
};

/** Open a cherry-pick PR referencing only clone tickets; marks as draft if conflicts. */
export const openCherryPickPR = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  params: {
    prTitle: string;
    originalPrNumber: number;
    targetBranch: string;
    cherryPickBranch: string;
    cherryPickClean: boolean;
    conflictDetails: string;
    clonedTickets: ClonedTicket[];
    matchedVersion: JiraVersion;
  },
): Promise<{ number: number; html_url: string }> => {
  const prBody = buildCherryPickPrBody(params);

  const newPr = await createPullRequest(octokit, owner, repo, {
    title: params.prTitle,
    body: prBody,
    head: params.cherryPickBranch,
    base: params.targetBranch,
    draft: !params.cherryPickClean,
  });

  if (!params.cherryPickClean) {
    await addLabel(octokit, owner, repo, newPr.number, CONFLICT_LABEL);
  }

  return newPr;
};
