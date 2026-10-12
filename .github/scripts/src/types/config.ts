export type ValidationCheck = {
  message: string;
  name: string;
  passed: boolean;
};

export type JiraConfig = {
  baseUrl: string;
  projectKey: string;
  token: string;
};

export type GitHubConfig = {
  owner: string;
  repo: string;
  /** Separate token for calls `token` may lack the scope for (e.g. a bot app token) -- commit statuses, reading .github/OWNERS. Falls back to `token` when unset. */
  statusToken?: string;
  token: string;
};

export type ClonedTicket = {
  clonedKey: string;
  originalKey: string;
};

export type CherryPickResult = {
  cherryPickBranch: string;
  cherryPickClean: boolean;
  conflictDetails: string;
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
