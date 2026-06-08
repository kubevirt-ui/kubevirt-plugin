export type ValidationCheck = {
  name: string;
  passed: boolean;
  message: string;
};

export type JiraConfig = {
  baseUrl: string;
  token: string;
  projectKey: string;
};

export type GitHubConfig = {
  token: string;
  owner: string;
  repo: string;
};

export type ClonedTicket = {
  originalKey: string;
  clonedKey: string;
};

export type CherryPickResult = {
  cherryPickClean: boolean;
  conflictDetails: string;
  cherryPickBranch: string;
};

export const JIRA_BASE_URL = 'https://redhat.atlassian.net';
export const JIRA_PROJECT_KEY = 'CNV';
export const REQUIRED_COMPONENT = 'CNV User Interface';
export const VALIDATION_COMMENT_MARKER = '<!-- jira-validation -->';
export const CLONE_COMMENT_MARKER = '<!-- jira-clone-result -->';
export const BLOCK_LABEL = 'do-not-merge/jira-invalid';
export const SKIP_LABEL = 'skip-jira-check';
export const CONFLICT_LABEL = 'do-not-merge/has-conflicts';
export const MIN_STORY_POINTS = 2;
