import { type JiraClient } from '../jira-client';
import { jiraErrorMessage } from '../utils';

import type { ClonedTicket, JiraCreateIssuePayload } from '../types/index';
import { buildClonePayload } from './clone-builder';

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
  const matchedVersion = projectVersions.find((ver) => ver.id === matchedVersionId);
  if (!matchedVersion) {
    throw new Error(`Fix version ID ${matchedVersionId} not found`);
  }

  const clonedTickets: ClonedTicket[] = [];

  for (const originalKey of ticketIds) {
    const originalIssue = await jira.getIssue(originalKey).catch((err: unknown) => {
      console.warn(`Warning: could not fetch ${originalKey}, skipping: ${jiraErrorMessage(err)}`);
      return null;
    });
    if (!originalIssue) {
      continue;
    }

    let clonePayload: JiraCreateIssuePayload | null;
    try {
      clonePayload = buildClonePayload(originalIssue, matchedVersion, discoveredFields);
    } catch (err: unknown) {
      console.warn(`Warning: could not clone ${originalKey}: ${jiraErrorMessage(err)}`);
      clonePayload = null;
    }
    if (!clonePayload) {
      continue;
    }

    const clonedIssue = await jira.createIssue(clonePayload).catch((err: unknown) => {
      console.warn(`Warning: could not clone ${originalKey}: ${jiraErrorMessage(err)}`);
      return null;
    });
    if (!clonedIssue) {
      continue;
    }

    console.log(`Cloned: ${originalKey} → ${clonedIssue.key}`);
    clonedTickets.push({ clonedKey: clonedIssue.key, originalKey });

    try {
      await jira.createIssueLink(clonedIssue.key, originalKey, 'Cloners');
    } catch (err: unknown) {
      console.warn(`Warning: could not link ${clonedIssue.key}: ${jiraErrorMessage(err)}`);
    }

    try {
      await jira.addComment(
        originalKey,
        `Cloned to ${clonedIssue.key} for ${targetBranch} via PR #${prNumber} (${repoFullName})`,
      );
    } catch (err: unknown) {
      console.warn(`Warning: could not comment on ${originalKey}: ${jiraErrorMessage(err)}`);
    }
  }

  return clonedTickets;
};
