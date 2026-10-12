import type {
  DiscoveredFields,
  JiraConfig,
  JiraCreateIssuePayload,
  JiraFieldMeta,
  JiraIssue,
  JiraVersion,
} from './types/index';

type RequestOptions = {
  body?: unknown;
  method?: string;
  params?: Record<string, string>;
};

/** Typed Jira Cloud REST API client with Basic auth. */
export class JiraClient {
  private authHeader: string;
  private baseUrl: string;
  private fieldCache: DiscoveredFields | null = null;

  private request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const { body, method = 'GET', params } = options;
    const url = params
      ? `${this.baseUrl}/rest/api/3${path}?${new URLSearchParams(params).toString()}`
      : `${this.baseUrl}/rest/api/3${path}`;

    const response = await fetch(url, {
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Accept: 'application/json',
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      method,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Jira API ${method} ${path} failed with status ${response.status}`, {
        cause: text,
      });
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  };

  /** Add a text comment to a Jira issue using ADF format. */
  addComment = async (issueKey: string, bodyText: string): Promise<void> => {
    await this.request<unknown>(`/issue/${issueKey}/comment`, {
      body: {
        body: {
          content: [{ content: [{ text: bodyText, type: 'text' }], type: 'paragraph' }],
          type: 'doc',
          version: 1,
        },
      },
      method: 'POST',
    });
  };

  /** Create a new Jira issue. */
  createIssue = async (payload: JiraCreateIssuePayload): Promise<JiraIssue> =>
    this.request<JiraIssue>('/issue', { body: payload, method: 'POST' });

  /** Link two issues (e.g., "Cloners" link type). */
  createIssueLink = async (
    inwardIssueKey: string,
    outwardIssueKey: string,
    linkTypeName: string = 'Cloners',
  ): Promise<void> => {
    await this.request<void>('/issueLink', {
      body: {
        inwardIssue: { key: inwardIssueKey },
        outwardIssue: { key: outwardIssueKey },
        type: { name: linkTypeName },
      },
      method: 'POST',
    });
  };

  /** Auto-discover custom field IDs for "Story Points" and "Activity Type" (cached). */
  discoverCustomFields = async (): Promise<DiscoveredFields> => {
    if (this.fieldCache) {
      return this.fieldCache;
    }

    const fields = await this.getAllFields();
    const storyPointsField = fields.find((field) => field.name.toLowerCase() === 'story points');
    const activityTypeField = fields.find((field) => field.name.toLowerCase() === 'activity type');

    this.fieldCache = {
      activityTypeFieldId: activityTypeField?.id ?? null,
      storyPointsFieldId: storyPointsField?.id ?? null,
    };
    return this.fieldCache;
  };

  getAllFields = async (): Promise<JiraFieldMeta[]> => this.request<JiraFieldMeta[]>('/field');

  /** Fetch a single Jira issue by key. */
  getIssue = async (issueKey: string): Promise<JiraIssue> =>
    this.request<JiraIssue>(`/issue/${issueKey}`);

  /** Fetch all versions (fix versions) for a Jira project. */
  getProjectVersions = async (projectKey: string): Promise<JiraVersion[]> =>
    this.request<JiraVersion[]>(`/project/${projectKey}/versions`);

  constructor(config: JiraConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.authHeader = `Basic ${config.token}`;
  }
}
