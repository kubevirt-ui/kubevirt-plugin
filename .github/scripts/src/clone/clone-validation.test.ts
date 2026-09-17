import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { JiraClient } from '../jira-client';

import type { GitHubConfig } from '../types/index';
import { CLONE_COMMENT_MARKER } from '../types/index';
import { validateCloneCommand } from './clone-validation';

type Call = { args: unknown; method: string };

const fakeOctokit = (calls: Call[]): Octokit =>
  ({
    issues: {
      createComment: async (args: unknown) => {
        calls.push({ args, method: 'createComment' });
      },
      listComments: async () => ({ data: [] }),
      updateComment: async () => {},
    },
    paginate: async () => [],
  }) as unknown as Octokit;

const fakeJira = (): JiraClient =>
  ({
    getProjectVersions: async () => [],
  }) as unknown as JiraClient;

const ghConfig: GitHubConfig = {
  owner: 'kubevirt-ui',
  repo: 'kubevirt-plugin',
  token: 'test-token',
};

describe('validateCloneCommand', () => {
  it('rejects unauthorized comment authors before clone setup', async () => {
    const calls: Call[] = [];
    const result = await validateCloneCommand(
      fakeOctokit(calls),
      fakeJira(),
      ghConfig,
      123,
      'CNV-12345: Example fix',
      '/clone release-4.20',
      'NONE',
    );

    assert.equal(result, null);
    assert.equal(calls.length, 1);
    const createCall = calls[0];
    assert.equal(createCall.method, 'createComment');
    const body = (createCall.args as { body: string }).body;
    assert.ok(body.includes(CLONE_COMMENT_MARKER));
    assert.match(body, /do not have write access/i);
  });
});
