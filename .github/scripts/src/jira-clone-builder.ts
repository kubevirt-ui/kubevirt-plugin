import { sanitizeDescriptionForClone } from './jira-adf-utils.js';
import type {
  DiscoveredFields,
  JiraCreateIssuePayload,
  JiraIssue,
  JiraVersion,
} from './types/index.js';

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
  if (description == null) {
    throw new Error(
      `Cannot clone ${original.key}: description is missing or empty after sanitization`,
    );
  }

  const payload: JiraCreateIssuePayload = {
    fields: {
      project: { key: 'CNV' },
      issuetype: { id: fields.issuetype.id },
      summary: fields.summary,
      description,
      labels: [...fields.labels],
      components: fields.components.map((c) => ({ id: c.id })),
      fixVersions: [{ id: targetFixVersion.id }],
    },
  };
  if (fields.assignee) {
    payload.fields.assignee = { accountId: fields.assignee.accountId };
  }
  if (fields.priority) {
    payload.fields.priority = { id: fields.priority.id };
  }

  if (discoveredFields.storyPointsFieldId) {
    const spValue = fields[discoveredFields.storyPointsFieldId as `customfield_${string}`];
    if (spValue != null) {
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
