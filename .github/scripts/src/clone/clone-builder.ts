import { buildClonedIssueSummary } from '../version-compare';

import type {
  DiscoveredFields,
  JiraCreateIssuePayload,
  JiraIssue,
  JiraVersion,
} from '../types/index';
import { sanitizeDescriptionForClone } from './adf-utils';

const isCustomFieldOption = (value: unknown): value is { id: string } =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof (value as { id: unknown }).id === 'string';

/** Build a Jira create-issue payload that clones an original ticket with a new fix version. */
export const buildClonePayload = (
  original: JiraIssue,
  targetFixVersion: JiraVersion,
  discoveredFields: DiscoveredFields,
): JiraCreateIssuePayload => {
  const { fields } = original;
  const description = sanitizeDescriptionForClone(fields.description);
  if (description === null || description === undefined) {
    throw new Error(
      `Cannot clone ${original.key}: description is missing or empty after sanitization`,
    );
  }

  const payload: JiraCreateIssuePayload = {
    fields: {
      components: fields.components.map((comp) => ({ id: comp.id })),
      description,
      fixVersions: [{ id: targetFixVersion.id }],
      issuetype: { id: fields.issuetype.id },
      labels: [...fields.labels],
      project: { key: 'CNV' },
      summary: buildClonedIssueSummary(fields.summary, targetFixVersion.name),
    },
  };
  if (fields.assignee) {
    payload.fields.assignee = { accountId: fields.assignee.accountId };
  }
  if (fields.reporter) {
    payload.fields.reporter = { accountId: fields.reporter.accountId };
  }
  if (fields.priority) {
    payload.fields.priority = { id: fields.priority.id };
  }

  if (discoveredFields.storyPointsFieldId) {
    const spValue = fields[discoveredFields.storyPointsFieldId as `customfield_${string}`];
    if (spValue !== null && spValue !== undefined) {
      payload.fields[discoveredFields.storyPointsFieldId as `customfield_${string}`] = spValue;
    }
  }

  if (discoveredFields.activityTypeFieldId) {
    const atValue = fields[discoveredFields.activityTypeFieldId as `customfield_${string}`];
    if (isCustomFieldOption(atValue)) {
      payload.fields[discoveredFields.activityTypeFieldId as `customfield_${string}`] = {
        id: atValue.id,
      };
    }
  }

  return payload;
};
