import type {
  DiscoveredFields,
  JiraCreateIssuePayload,
  JiraIssue,
  JiraVersion,
} from './types/index.js';

/** Build a Jira create-issue payload that clones an original ticket with a new fix version. */
export const buildClonePayload = (
  original: JiraIssue,
  targetFixVersion: JiraVersion,
  discoveredFields: DiscoveredFields,
): JiraCreateIssuePayload => {
  const { fields } = original;

  const payload: JiraCreateIssuePayload = {
    fields: {
      project: { key: 'CNV' },
      issuetype: { id: fields.issuetype.id },
      summary: fields.summary,
      description: fields.description,
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

  if (discoveredFields.productTypeFieldId) {
    const ptValue = fields[discoveredFields.productTypeFieldId as `customfield_${string}`];
    if (ptValue != null) {
      payload.fields[discoveredFields.productTypeFieldId as `customfield_${string}`] = ptValue;
    }
  }

  return payload;
};
