import type {
  DiscoveredFields,
  JiraConfig,
  JiraCreateIssuePayload,
  JiraFieldMeta,
  JiraIssue,
  JiraVersion,
} from './types/index';

type RequestOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
};

/** Typed Jira Cloud REST API client with Basic auth. */
export class JiraClient {
  private authHeader: string;
  private baseUrl: string;
  private fieldCache: DiscoveredFields | null = null;

  private request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const { method = 'GET', body, params } = options;
    let url = `${this.baseUrl}/rest/api/3${path}`;

    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
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
      method: 'POST',
      body: {
        body: {
          type: 'doc',
          version: 1,
          content: [{ type: 'paragraph', content: [{ type: 'text', text: bodyText }] }],
        },
      },
    });
  };

  /** Create a new Jira issue. */
  createIssue = async (payload: JiraCreateIssuePayload): Promise<JiraIssue> =>
    this.request<JiraIssue>('/issue', { method: 'POST', body: payload });

  /** Link two issues (e.g., "Cloners" link type). */
  createIssueLink = async (
    inwardIssueKey: string,
    outwardIssueKey: string,
    linkTypeName: string = 'Cloners',
  ): Promise<void> => {
    await this.request<void>('/issueLink', {
      method: 'POST',
      body: {
        type: { name: linkTypeName },
        inwardIssue: { key: inwardIssueKey },
        outwardIssue: { key: outwardIssueKey },
      },
    });
  };

  /** Auto-discover custom field IDs for "Story Points" and "Activity Type" (cached). */
  discoverCustomFields = async (): Promise<DiscoveredFields> => {
    if (this.fieldCache) return this.fieldCache;

    const fields = await this.getAllFields();
    let storyPointsFieldId: string | null = null;
    let activityTypeFieldId: string | null = null;

    for (const field of fields) {
      const nameLower = field.name.toLowerCase();
      if (!storyPointsFieldId && nameLower === 'story points') {
        storyPointsFieldId = field.id;
      }
      if (!activityTypeFieldId && nameLower === 'activity type') {
        activityTypeFieldId = field.id;
      }
      if (storyPointsFieldId && activityTypeFieldId) break;
    }

    this.fieldCache = { storyPointsFieldId, activityTypeFieldId };
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
