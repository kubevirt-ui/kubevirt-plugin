import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { executeJiraValidation } from './execute';
import { HandledValidationError } from '../pr-path-validation/errors';
import type { GitHubConfig } from '../../types/index';

type Call = { method: string; args: unknown };

type FakeOctokitOptions = {
  labels?: string[];
  branches?: string[];
  branchesError?: boolean;
  /** Fake "labeled" issue-events, most recent last -- drives skip-label trust. */
  labelEvents?: Array<{ label: string; actor: string }>;
  ownersContent?: string | null;
};

const fakeOctokit = (options: FakeOctokitOptions, calls: Call[]): Octokit => {
  const labels = new Set(options.labels ?? []);
  const listEvents = async () => ({
    data: (options.labelEvents ?? []).map((e) => ({
      actor: { login: e.actor },
      event: 'labeled',
      label: { name: e.label },
    })),
  });
  return {
    paginate: async (method: unknown) => {
      if (method === listEvents) return (await listEvents()).data;
      return [];
    },
    issues: {
      listEvents,
      listComments: async () => ({ data: [] }),
      createComment: async () => {
        calls.push({ method: 'createComment', args: {} });
      },
      updateComment: async () => {},
      listLabelsOnIssue: async () => ({ data: [...labels].map((name) => ({ name })) }),
      getLabel: async ({ name }: { name: string }) => {
        if (!labels.has(name)) {
          const err = new Error('Not Found') as Error & { status: number };
          err.status = 404;
          throw err;
        }
        return { data: {} };
      },
      createLabel: async () => ({ data: {} }),
      addLabels: async (args: unknown) => {
        calls.push({ method: 'addLabels', args });
      },
      removeLabel: async (args: unknown) => {
        calls.push({ method: 'removeLabel', args });
      },
    },
    repos: {
      listBranches: async () => {
        if (options.branchesError) throw new Error('API rate limit exceeded');
        return { data: (options.branches ?? []).map((name) => ({ name })) };
      },
      createCommitStatus: async (args: unknown) => {
        calls.push({ method: 'createCommitStatus', args });
      },
      getContent: async () => {
        if (options.ownersContent === null || options.ownersContent === undefined) {
          throw new Error('Not Found');
        }
        return {
          data: { content: Buffer.from(options.ownersContent, 'utf8').toString('base64') },
        };
      },
    },
  } as unknown as Octokit;
};

const CONFIG: GitHubConfig = { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' };

const statusesOf = (calls: Call[]): Array<{ state: string; description: string }> =>
  calls
    .filter((c) => c.method === 'createCommitStatus')
    .map((c) => c.args as { state: string; description: string });

describe('executeJiraValidation', () => {
  const originalJiraToken = process.env.JIRA_TOKEN;

  beforeEach(() => {
    delete process.env.JIRA_TOKEN;
  });

  afterEach(() => {
    if (originalJiraToken === undefined) {
      delete process.env.JIRA_TOKEN;
    } else {
      process.env.JIRA_TOKEN = originalJiraToken;
    }
  });

  it('throws HandledValidationError and posts a specific failure status when the PR title has no ticket ID', async () => {
    const mainCalls: Call[] = [];
    const statusCalls: Call[] = [];
    const octokit = fakeOctokit({}, mainCalls);
    const statusOctokit = fakeOctokit({}, statusCalls);

    await assert.rejects(
      executeJiraValidation({
        baseBranch: 'main',
        config: CONFIG,
        headSha: 'abc123',
        octokit,
        prNumber: 1,
        prTitle: 'Fix the login button',
        statusOctokit,
      }),
      HandledValidationError,
    );

    assert.equal(
      mainCalls.some((c) => c.method === 'createCommitStatus'),
      false,
    );
    const statuses = statusesOf(statusCalls);
    assert.equal(statuses.at(-1)?.state, 'failure');
    assert.equal(statuses.at(-1)?.description, 'No CNV ticket ID found in PR title');
  });

  it('throws HandledValidationError and posts an error status when release branches cannot be resolved', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ branchesError: true }, calls);

    await assert.rejects(
      executeJiraValidation({
        baseBranch: 'main',
        config: CONFIG,
        headSha: 'abc123',
        octokit,
        prNumber: 1,
        prTitle: 'CNV-12345: Fix the login button',
        statusOctokit: octokit,
      }),
      HandledValidationError,
    );

    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'error');
    assert.match(statuses.at(-1)?.description ?? '', /Failed to resolve release branches/);
  });

  it('throws HandledValidationError and posts an error status when JIRA_TOKEN is missing', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ branches: [] }, calls);

    await assert.rejects(
      executeJiraValidation({
        baseBranch: 'main',
        config: CONFIG,
        headSha: 'abc123',
        octokit,
        prNumber: 1,
        prTitle: 'CNV-12345: Fix the login button',
        statusOctokit: octokit,
      }),
      HandledValidationError,
    );

    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'error');
    assert.equal(statuses.at(-1)?.description, 'Jira validation misconfigured: missing JIRA_TOKEN');
  });

  it('throws HandledValidationError and posts a failure status when a ticket check fails', async () => {
    process.env.JIRA_TOKEN = 'fake-jira-token';
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      ({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      }) as unknown as Response) as typeof fetch;

    try {
      const calls: Call[] = [];
      const octokit = fakeOctokit({ branches: [] }, calls);

      await assert.rejects(
        executeJiraValidation({
          baseBranch: 'main',
          config: CONFIG,
          headSha: 'abc123',
          octokit,
          prNumber: 1,
          prTitle: 'CNV-12345: Fix the login button',
          statusOctokit: octokit,
        }),
        HandledValidationError,
      );

      const statuses = statusesOf(calls);
      assert.equal(statuses.at(-1)?.state, 'failure');
      assert.equal(statuses.at(-1)?.description, 'One or more Jira checks failed');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('skips validation and posts a success status when the skip label was applied by a trusted actor', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      {
        labelEvents: [{ actor: 'kubevirt-plugin-bot[bot]', label: 'skip-jira-check' }],
        labels: ['skip-jira-check'],
      },
      calls,
    );

    await executeJiraValidation({
      baseBranch: 'main',
      config: CONFIG,
      headSha: 'abc123',
      octokit,
      prNumber: 1,
      prTitle: 'Fix the login button',
      statusOctokit: octokit,
    });

    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'success');
    assert.equal(statuses.at(-1)?.description, 'Jira validation skipped');
  });

  it('ignores an untrusted skip label and fails closed when the title has no ticket', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      {
        labelEvents: [{ actor: 'random-user', label: 'skip-jira-check' }],
        labels: ['skip-jira-check'],
      },
      calls,
    );

    await assert.rejects(
      executeJiraValidation({
        baseBranch: 'main',
        config: CONFIG,
        headSha: 'abc123',
        octokit,
        prNumber: 1,
        prTitle: 'Fix the login button',
        statusOctokit: octokit,
      }),
      HandledValidationError,
    );

    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'failure');
    assert.equal(statuses.at(-1)?.description, 'No CNV ticket ID found in PR title');
  });
});
