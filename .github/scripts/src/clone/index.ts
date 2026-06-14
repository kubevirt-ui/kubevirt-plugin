import { JiraClient } from '../jira-client.js';
import { createOctokit, branchExists } from '../github-repo.js';
import { upsertComment } from '../github-comments.js';
import {
  extractTicketIds,
  extractVersionFromBranch,
  findMatchingFixVersion,
} from '../version-utils.js';
import { cloneAllTickets } from './clone-tickets.js';
import { performCherryPick, openCherryPickPR } from './cherry-pick.js';
import { requireEnv } from '../utils.js';
import { CLONE_COMMENT_MARKER, JIRA_BASE_URL, JIRA_PROJECT_KEY } from '../types/index.js';
import type { GitHubConfig } from '../types/index.js';

const ALLOWED_ASSOCIATIONS = new Set(['MEMBER', 'OWNER', 'COLLABORATOR']);
const CLONE_CMD_REGEX = /^\/clone\s+(release-\d+\.\d+)\s*$/m;

/** Post a clone failure message as an idempotent PR comment. */
const postError = async (
  octokit: ReturnType<typeof createOctokit>,
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

/** Entrypoint: parse /clone command, clone Jira tickets, cherry-pick, and open a new PR. */
const main = async (): Promise<void> => {
  const ghConfig: GitHubConfig = {
    token: requireEnv('GITHUB_TOKEN'),
    owner: requireEnv('REPO_OWNER'),
    repo: requireEnv('REPO_NAME'),
  };

  const prNumber = parseInt(requireEnv('PR_NUMBER'), 10);
  const prTitle = requireEnv('PR_TITLE');
  const headSha = requireEnv('HEAD_SHA');
  const mergeCommitSha = process.env['MERGE_COMMIT_SHA'] || '';
  const commentBody = requireEnv('COMMENT_BODY');
  const commentAuthorAssociation = requireEnv('COMMENT_AUTHOR_ASSOCIATION');
  const octokit = createOctokit(ghConfig);

  if (!ALLOWED_ASSOCIATIONS.has(commentAuthorAssociation)) {
    await postError(octokit, ghConfig, prNumber, 'You do not have write access to use `/clone`.');
    process.exit(1);
  }

  const cmdMatch = commentBody.match(CLONE_CMD_REGEX);
  if (!cmdMatch) return;

  const targetBranch = cmdMatch[1]!;
  const targetVersion = extractVersionFromBranch(targetBranch);
  if (!targetVersion) {
    await postError(octokit, ghConfig, prNumber, `Invalid branch: \`${targetBranch}\``);
    process.exit(1);
  }

  if (!(await branchExists(octokit, ghConfig.owner, ghConfig.repo, targetBranch))) {
    await postError(octokit, ghConfig, prNumber, `Branch \`${targetBranch}\` does not exist.`);
    process.exit(1);
  }

  const ticketIds = extractTicketIds(prTitle);
  if (ticketIds.length === 0) {
    await postError(octokit, ghConfig, prNumber, 'No `CNV-XXXXX` found in title.');
    process.exit(1);
  }

  const jira = new JiraClient({
    baseUrl: JIRA_BASE_URL,
    token: requireEnv('JIRA_TOKEN'),
    projectKey: JIRA_PROJECT_KEY,
  });
  const projectVersions = await jira.getProjectVersions(JIRA_PROJECT_KEY);
  const matchedVersion = findMatchingFixVersion(projectVersions, targetVersion);
  if (!matchedVersion) {
    const available = projectVersions
      .filter((v) => !v.archived)
      .map((v) => v.name)
      .join(', ');
    await postError(
      octokit,
      ghConfig,
      prNumber,
      `No fix version for \`${targetVersion}\`.\n\nAvailable: ${available}`,
    );
    process.exit(1);
  }

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
    await postError(
      octokit,
      ghConfig,
      prNumber,
      `Failed to clone any tickets: ${ticketIds.join(', ')}`,
    );
    process.exit(1);
  }

  const primaryClone = clonedTickets[0]!;
  const cherryPickBranch = `cherry-pick-${primaryClone.clonedKey.toLowerCase()}-to-${targetBranch}`;
  const commitSha = mergeCommitSha || headSha;

  let result: Awaited<ReturnType<typeof performCherryPick>>;
  try {
    result = performCherryPick(targetBranch, commitSha, cherryPickBranch, clonedTickets);
  } catch (err) {
    const keys = clonedTickets
      .map((ct) => `[${ct.clonedKey}](${JIRA_BASE_URL}/browse/${ct.clonedKey})`)
      .join(', ');
    await postError(octokit, ghConfig, prNumber, `Cherry-pick failed.\n\nCloned tickets: ${keys}`);
    process.exit(1);
  }

  const originalSummary = prTitle.replace(/^(?:\[.*?\]\s*)?(?:CNV-\d+\s*)+:\s*/i, '').trim();
  const newPrTitle = `[${targetBranch}] ${clonedTickets
    .map((ct) => ct.clonedKey)
    .join(' ')}: ${originalSummary}`;

  const newPr = await openCherryPickPR(octokit, ghConfig.owner, ghConfig.repo, {
    prTitle: newPrTitle,
    originalPrNumber: prNumber,
    targetBranch,
    cherryPickBranch: result.cherryPickBranch,
    cherryPickClean: result.cherryPickClean,
    conflictDetails: result.conflictDetails,
    clonedTickets,
    matchedVersion,
  });

  const statusIcon = result.cherryPickClean ? ':white_check_mark:' : ':warning:';
  const draftNote = result.cherryPickClean ? '' : ' (opened as **draft**)';
  const rows = clonedTickets.map(
    (ct) =>
      `| ${ct.originalKey} → ${ct.clonedKey} | [${ct.clonedKey}](${JIRA_BASE_URL}/browse/${ct.clonedKey}) |`,
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

main().catch((err) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : 'Unknown error');
  process.exit(1);
});
