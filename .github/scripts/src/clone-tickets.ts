import { JiraClient } from './jira-client.js';
import { buildClonePayload } from './jira-clone-builder.js';
import { jiraErrorMessage } from './utils.js';
import type { ClonedTicket, JiraCreateIssuePayload, JiraIssue } from './types/index.js';

/** Clone all Jira tickets for a release branch, linking and commenting on each original. */
export const cloneAllTickets = async (
  jira: JiraClient,
  ticketIds: string[],
  matchedVersionId: string,
  targetBranch: string,
  prNumber: number,
  repoFullName: string,
): Promise<ClonedTicket[]> => {
  const discoveredFields = await jira.discoverCustomFields();
  const projectVersions = await jira.getProjectVersions('CNV');
  const matchedVersion = projectVersions.find((v) => v.id === matchedVersionId);
  if (!matchedVersion) throw new Error(`Fix version ID ${matchedVersionId} not found`);

  const clonedTickets: ClonedTicket[] = [];

  for (const originalKey of ticketIds) {
    let originalIssue: JiraIssue;
    try {
      originalIssue = await jira.getIssue(originalKey);
    } catch (err) {
      console.warn(`Warning: could not fetch ${originalKey}, skipping: ${jiraErrorMessage(err)}`);
      continue;
    }

    let clonePayload: JiraCreateIssuePayload;
    try {
      clonePayload = buildClonePayload(originalIssue, matchedVersion, discoveredFields);
    } catch (err) {
      console.warn(`Warning: could not clone ${originalKey}: ${jiraErrorMessage(err)}`);
      continue;
    }

    let clonedIssue: JiraIssue;

    try {
      clonedIssue = await jira.createIssue(clonePayload);
    } catch (err) {
      console.warn(`Warning: could not clone ${originalKey}: ${jiraErrorMessage(err)}`);
      continue;
    }

    console.log(`Cloned: ${originalKey} → ${clonedIssue.key}`);
    clonedTickets.push({ originalKey, clonedKey: clonedIssue.key });

    try {
      await jira.createIssueLink(clonedIssue.key, originalKey, 'Cloners');
    } catch (err) {
      console.warn(`Warning: could not link ${clonedIssue.key}: ${jiraErrorMessage(err)}`);
    }

    try {
      await jira.addComment(
        originalKey,
        `Cloned to ${clonedIssue.key} for ${targetBranch} via PR #${prNumber} (${repoFullName})`,
      );
    } catch (err) {
      console.warn(`Warning: could not comment on ${originalKey}: ${jiraErrorMessage(err)}`);
    }
  }

  return clonedTickets;
};
