export type JiraUser = {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  active: boolean;
};

export type JiraVersion = {
  id: string;
  name: string;
  archived: boolean;
  released: boolean;
  description?: string;
};

export type JiraComponent = {
  id: string;
  name: string;
  description?: string;
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
  type: { id: string; name: string; inward: string; outward: string };
  inwardIssue?: { key: string };
  outwardIssue?: { key: string };
};

export type JiraIssueFields = {
  summary: string;
  description: unknown;
  issuetype: JiraIssueType;
  status: JiraStatus;
  priority: JiraPriority;
  assignee: JiraUser | null;
  reporter: JiraUser | null;
  labels: string[];
  components: JiraComponent[];
  fixVersions: JiraVersion[];
  issuelinks: JiraIssueLink[];
  [customField: `customfield_${string}`]: unknown;
};

export type JiraIssue = {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
};

export type JiraFieldMeta = {
  id: string;
  key: string;
  name: string;
  custom: boolean;
  schema?: { type: string; custom?: string };
};

export type JiraCreateIssuePayload = {
  fields: {
    project: { key: string };
    issuetype: { id: string };
    summary: string;
    description?: unknown;
    labels?: string[];
    components?: Array<{ id: string }>;
    assignee?: { accountId: string } | null;
    priority?: { id: string };
    fixVersions?: Array<{ id: string }>;
    [customField: `customfield_${string}`]: unknown;
  };
};

export type DiscoveredFields = {
  storyPointsFieldId: string | null;
  productTypeFieldId: string | null;
};
