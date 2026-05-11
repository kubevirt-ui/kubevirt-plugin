import { execFileSync } from 'node:child_process';
import { Octokit } from '@octokit/rest';

import { addLabel } from './github-comments.js';
import { createPullRequest } from './github-repo.js';
import { CONFLICT_LABEL, JIRA_BASE_URL } from './types/index.js';
import type { CherryPickResult, ClonedTicket, JiraVersion } from './types/index.js';

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

/** Cherry-pick a commit onto a target branch; aborts cleanly on conflicts. */
export const performCherryPick = (
  targetBranch: string,
  commitSha: string,
  branchName: string,
): CherryPickResult => {
  let cherryPickClean = true;
  let conflictDetails = '';

  git('fetch', 'origin', targetBranch);
  git('checkout', '-b', branchName, `origin/${targetBranch}`);

  try {
    git('cherry-pick', commitSha, '-m', '1', '--allow-empty');
  } catch {
    cherryPickClean = false;
    conflictDetails = gitSafe('diff', '--name-only', '--diff-filter=U');
    git('cherry-pick', '--abort');
    git('commit', '--allow-empty', '-m',
      `[CONFLICTS] Cherry-pick ${commitSha} to ${targetBranch} - manual resolution required`);
  }

  git('push', 'origin', branchName);

  return { cherryPickClean, conflictDetails, cherryPickBranch: branchName };
};

/** Open a cherry-pick PR with ticket mapping table; marks as draft if conflicts. */
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
  const { originalPrNumber, targetBranch, matchedVersion, clonedTickets } = params;

  const ticketMappingLines = clonedTickets.map((ct) =>
    `| [${ct.originalKey}](${JIRA_BASE_URL}/browse/${ct.originalKey}) | [${ct.clonedKey}](${JIRA_BASE_URL}/browse/${ct.clonedKey}) |`,
  );

  const prBody = [
    `## Cherry-pick of #${originalPrNumber} to \`${targetBranch}\``,
    '',
    `**Original PR**: #${originalPrNumber}`,
    `**Fix version**: ${matchedVersion.name}`,
    '',
    '### Cloned tickets',
    '| Original | Clone |',
    '|----------|-------|',
    ...ticketMappingLines,
    '',
    params.cherryPickClean
      ? ':white_check_mark: Cherry-pick applied cleanly.'
      : `:warning: **Cherry-pick had conflicts.** Files needing resolution:\n\`\`\`\n${params.conflictDetails}\n\`\`\``,
  ].join('\n');

  const newPr = await createPullRequest(octokit, owner, repo, {
    title: params.prTitle,
    body: prBody,
    head: params.cherryPickBranch,
    base: targetBranch,
    draft: !params.cherryPickClean,
  });

  if (!params.cherryPickClean) {
    await addLabel(octokit, owner, repo, newPr.number, CONFLICT_LABEL);
  }

  return newPr;
};
