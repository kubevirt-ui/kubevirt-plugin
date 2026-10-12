export type JiraUser = {
  accountId: string;
  active: boolean;
  displayName: string;
  emailAddress?: string;
};

export type JiraVersion = {
  archived: boolean;
  description?: string;
  id: string;
  name: string;
  released: boolean;
};

export type JiraComponent = {
  description?: string;
  id: string;
  name: string;
};

export type JiraPriority = {
  id: string;
  name: string;
};

export type JiraIssueType = {
  id: string;
  name: string;
  subtask: boolean;
};

export type JiraStatus = {
  id: string;
  name: string;
  statusCategory: { key: string; name: string };
};

export type JiraIssueLink = {
  id: string;
  inwardIssue?: { key: string };
  outwardIssue?: { key: string };
  type: { id: string; inward: string; name: string; outward: string };
};

export type JiraIssueFields = {
  [customField: `customfield_${string}`]: unknown;
  assignee: JiraUser | null;
  components: JiraComponent[];
  description: unknown;
  fixVersions: JiraVersion[];
  issuelinks: JiraIssueLink[];
  issuetype: JiraIssueType;
  labels: string[];
  priority: JiraPriority;
  reporter: JiraUser | null;
  status: JiraStatus;
  summary: string;
};

export type JiraIssue = {
  fields: JiraIssueFields;
  id: string;
  key: string;
  self: string;
};

export type JiraFieldMeta = {
  custom: boolean;
  id: string;
  key: string;
  name: string;
  schema?: { custom?: string; type: string };
};

export type JiraCreateIssuePayload = {
  fields: {
    [customField: `customfield_${string}`]: unknown;
    assignee?: { accountId: string } | null;
    components?: Array<{ id: string }>;
    description?: unknown;
    fixVersions?: Array<{ id: string }>;
    issuetype: { id: string };
    labels?: string[];
    priority?: { id: string };
    project: { key: string };
    reporter?: { accountId: string } | null;
    summary: string;
  };
};

export type DiscoveredFields = {
  activityTypeFieldId: null | string;
  storyPointsFieldId: null | string;
};
