import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { GitHubConfig } from '../../types/index';
import { HandledValidationError } from '../pr-path-validation/errors';
import { executeJiraValidation } from './execute';

type Call = { args: unknown; method: string };

type FakeOctokitOptions = {
  branches?: string[];
  branchesError?: boolean;
  /** Fake "labeled" issue-events, most recent last -- drives skip-label trust. */
  labelEvents?: Array<{ actor: string; label: string }>;
  labels?: string[];
  ownersContent?: null | string;
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
  const listComments = async () => ({ data: [] as Array<{ body: string; id: number }> });
  return {
    issues: {
      addLabels: async (args: unknown) => {
        calls.push({ args, method: 'addLabels' });
      },
      createComment: async (args: unknown) => {
        calls.push({ args, method: 'createComment' });
      },
      createLabel: async () => ({ data: {} }),
      getLabel: async ({ name }: { name: string }) => {
        if (!labels.has(name)) {
          const err = new Error('Not Found') as Error & { status: number };
          err.status = 404;
          throw err;
        }
        return { data: {} };
      },
      listComments,
      listEvents,
      listLabelsOnIssue: async () => ({ data: [...labels].map((name) => ({ name })) }),
      removeLabel: async (args: unknown) => {
        calls.push({ args, method: 'removeLabel' });
      },
      updateComment: async () => {},
    },
    paginate: async (method: unknown) => {
      if (method === listEvents) return (await listEvents()).data;
      if (method === listComments) return (await listComments()).data;
      return [];
    },
    repos: {
      createCommitStatus: async (args: unknown) => {
        calls.push({ args, method: 'createCommitStatus' });
      },
      getContent: async () => {
        if (options.ownersContent === null || options.ownersContent === undefined) {
          throw new Error('Not Found');
        }
        return {
          data: { content: Buffer.from(options.ownersContent, 'utf8').toString('base64') },
        };
      },
      listBranches: async () => {
        if (options.branchesError) throw new Error('API rate limit exceeded');
        return { data: (options.branches ?? []).map((name) => ({ name })) };
      },
    },
  } as unknown as Octokit;
};

const CONFIG: GitHubConfig = { owner: 'kubevirt-ui', repo: 'kubevirt-plugin', token: 'x' };

const addLabelsOf = (calls: Call[]): string[] =>
  calls
    .filter((c) => c.method === 'addLabels')
    .flatMap((c) => (c.args as { labels: string[] }).labels);

const commentsOf = (calls: Call[]): string[] =>
  calls.filter((c) => c.method === 'createComment').map((c) => (c.args as { body: string }).body);

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

  it('throws HandledValidationError and posts a failure comment when the PR title has no ticket ID', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({}, calls);

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

    const comments = commentsOf(calls);
    assert.ok(comments.some((body) => body.includes('No `CNV-XXXXX` ticket ID found')));
    assert.ok(addLabelsOf(calls).includes('do-not-merge/jira-invalid'));
  });

  it('throws HandledValidationError when release branches cannot be resolved', async () => {
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
  });

  it('throws HandledValidationError when JIRA_TOKEN is missing', async () => {
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
  });

  it('throws HandledValidationError and adds block label when a ticket check fails', async () => {
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

      assert.ok(addLabelsOf(calls).includes('do-not-merge/jira-invalid'));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('skips validation and removes block label when the skip label was applied by a trusted actor', async () => {
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

    const comments = commentsOf(calls);
    assert.ok(comments.some((body) => body.includes('Jira Validation Skipped')));
    assert.equal(addLabelsOf(calls).includes('do-not-merge/jira-invalid'), false);
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

    assert.ok(addLabelsOf(calls).includes('do-not-merge/jira-invalid'));
  });
});
