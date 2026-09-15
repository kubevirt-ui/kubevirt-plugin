import { execFileSync } from 'node:child_process';

import { type Octokit } from '@octokit/rest';

import { addLabel } from '../github-comments';
import { createPullRequest } from '../github-repo';
import { rewriteJiraKeysInText, stripOriginalJiraKeys } from '../version-parse';

import type { CherryPickResult, ClonedTicket, JiraVersion } from '../types/index';
import { CONFLICT_LABEL, JIRA_BASE_URL } from '../types/index';
import { buildCherryPickArgs, getRepoRoot, git, gitSafe, isMergeCommit } from './git-helpers';

/** Amend the latest commit message, preserving multi-line bodies. */
const amendCommitMessage = (message: string): void => {
  execFileSync('git', ['commit', '--amend', '-F', '-'], {
    cwd: getRepoRoot(),
    encoding: 'utf-8',
    input: message,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
};

/** Cherry-pick a commit onto a target branch; opens a draft PR branch on conflicts. */
export const performCherryPick = (
  targetBranch: string,
  commitSha: string,
  branchName: string,
  clonedTickets: ClonedTicket[],
): CherryPickResult => {
  gitSafe('branch', '-D', branchName);
  git('checkout', '-B', branchName, `origin/${targetBranch}`);

  const { cherryPickClean, conflictDetails } = ((): {
    cherryPickClean: boolean;
    conflictDetails: string;
  } => {
    const pickArgs = buildCherryPickArgs(commitSha, isMergeCommit(commitSha));

    try {
      git(...pickArgs);

      if (clonedTickets.length > 0) {
        const originalMessage = git('log', '-1', '--format=%B');
        const rewrittenMessage = rewriteJiraKeysInText(originalMessage, clonedTickets);
        if (rewrittenMessage !== originalMessage) {
          amendCommitMessage(rewrittenMessage);
        }
      }
      return { cherryPickClean: true, conflictDetails: '' };
    } catch (pickErr: unknown) {
      const conflictedFiles = gitSafe('diff', '--name-only', '--diff-filter=U');
      gitSafe('cherry-pick', '--abort');
      git(
        'commit',
        '--allow-empty',
        '-m',
        `[CONFLICTS] Cherry-pick ${commitSha} to ${targetBranch} - manual resolution required`,
      );

      const details = conflictedFiles || formatCherryPickFailure(pickErr);
      return { cherryPickClean: false, conflictDetails: details };
    }
  })();

  git('push', '--force-with-lease', '-u', 'origin', branchName);

  return { cherryPickBranch: branchName, cherryPickClean, conflictDetails };
};

const formatCherryPickFailure = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  return 'Cherry-pick failed with an unknown error';
};

/** Build PR body with clone ticket references only (no original Jira keys). */
export const buildCherryPickPrBody = (params: {
  cherryPickClean: boolean;
  clonedTickets: ClonedTicket[];
  conflictDetails: string;
  matchedVersion: JiraVersion;
  originalPrNumber: number;
  targetBranch: string;
}): string => {
  const {
    cherryPickClean,
    clonedTickets,
    conflictDetails,
    matchedVersion,
    originalPrNumber,
    targetBranch,
  } = params;

  const jiraLines = clonedTickets.map(
    (ticket) => `- [${ticket.clonedKey}](${JIRA_BASE_URL}/browse/${ticket.clonedKey})`,
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
    cherryPickBranch: string;
    cherryPickClean: boolean;
    clonedTickets: ClonedTicket[];
    conflictDetails: string;
    matchedVersion: JiraVersion;
    originalPrNumber: number;
    prTitle: string;
    targetBranch: string;
  },
): Promise<{ html_url: string; number: number }> => {
  const prBody = buildCherryPickPrBody(params);

  const newPr = await createPullRequest(octokit, owner, repo, {
    base: params.targetBranch,
    body: prBody,
    draft: !params.cherryPickClean,
    head: params.cherryPickBranch,
    title: params.prTitle,
  });

  if (!params.cherryPickClean) {
    await addLabel(octokit, owner, repo, newPr.number, CONFLICT_LABEL);
  }

  return newPr;
};
