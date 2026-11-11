import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { JiraClient } from '../jira-client';

import type { GitHubConfig, JiraVersion } from '../types/index';
import { CLONE_COMMENT_MARKER } from '../types/index';
import { validateCloneCommand } from './clone-validation';

type Call = { args: unknown; method: string };

const fakeOctokit = (calls: Call[], ownersContent: string): Octokit =>
  ({
    issues: {
      createComment: async (args: unknown) => {
        calls.push({ args, method: 'createComment' });
      },
      listComments: async () => ({ data: [] }),
      updateComment: async () => {},
    },
    repos: {
      getContent: async (args: unknown) => {
        calls.push({ args, method: 'getContent' });
        return { data: { content: Buffer.from(ownersContent, 'utf8').toString('base64') } };
      },
      getBranch: async () => ({ data: {} }),
    },
    paginate: async () => [],
  }) as unknown as Octokit;

const fakeJira = (versions: JiraVersion[] = []): JiraClient =>
  ({
    getProjectVersions: async () => versions,
  }) as unknown as JiraClient;

const ghConfig: GitHubConfig = {
  owner: 'kubevirt-ui',
  repo: 'kubevirt-plugin',
  token: 'test-token',
};

describe('validateCloneCommand', () => {
  it('rejects comment authors who are not root OWNERS approvers', async () => {
    const calls: Call[] = [];
    const result = await validateCloneCommand(
      fakeOctokit(calls, ['approvers:', '  - alice-approver'].join('\n')),
      fakeJira(),
      ghConfig,
      123,
      'CNV-12345: Example fix',
      '/clone release-4.20',
      'random-user',
    );

    assert.equal(result, null);
    const createCall = calls.find((call) => call.method === 'createComment');
    assert.ok(createCall);
    assert.equal(createCall.method, 'createComment');
    const body = (createCall.args as { body: string }).body;
    assert.ok(body.includes(CLONE_COMMENT_MARKER));
    assert.match(body, /root OWNERS approvers/i);
  });

  it('rejects root OWNERS reviewers because clone is approver-only', async () => {
    const calls: Call[] = [];
    const result = await validateCloneCommand(
      fakeOctokit(
        calls,
        ['approvers:', '  - alice-approver', 'reviewers:', '  - bob-reviewer'].join('\n'),
      ),
      fakeJira(),
      ghConfig,
      123,
      'CNV-12345: Example fix',
      '/clone release-4.20',
      'bob-reviewer',
    );

    assert.equal(result, null);
    const createCall = calls.find((call) => call.method === 'createComment');
    assert.ok(createCall);
    assert.match((createCall.args as { body: string }).body, /root OWNERS approvers/i);
  });

  it('allows a root OWNERS approver to continue through normal clone validation', async () => {
    const calls: Call[] = [];
    const version: JiraVersion = {
      archived: false,
      id: '420',
      name: 'CNV 4.20.z',
      released: false,
    };

    const result = await validateCloneCommand(
      fakeOctokit(calls, ['approvers:', '  - alice-approver'].join('\n')),
      fakeJira([version]),
      ghConfig,
      123,
      'CNV-12345: Example fix',
      '/clone release-4.20',
      'alice-approver',
    );

    assert.deepEqual(result, {
      matchedVersion: version,
      targetBranch: 'release-4.20',
      ticketIds: ['CNV-12345'],
    });
    assert.equal(
      calls.some((call) => call.method === 'createComment'),
      false,
    );
    const getContentCalls = calls.filter((call) => call.method === 'getContent');
    assert.deepEqual(
      getContentCalls.map(({ args }) => {
        const { path, ref } = args as { path: string; ref?: string };
        return { path, ref };
      }),
      [{ path: 'OWNERS', ref: 'main' }],
    );
  });
});
