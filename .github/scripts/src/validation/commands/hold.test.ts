import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { ApprovalContext } from './approve';
import { applyHold, cancelHold } from './hold';

type Call = { args: unknown; method: string };

const fakeOctokit = (permission: null | string, calls: Call[]): Octokit =>
  ({
    issues: {
      addLabels: async (args: unknown) => {
        calls.push({ args, method: 'addLabels' });
      },
      createComment: async (args: unknown) => {
        calls.push({ args, method: 'createComment' });
      },
      getLabel: async (args: unknown) => {
        calls.push({ args, method: 'getLabel' });
        return { data: {} };
      },
      removeLabel: async (args: unknown) => {
        calls.push({ args, method: 'removeLabel' });
      },
    },
    reactions: {
      createForIssueComment: async (args: unknown) => {
        calls.push({ args, method: 'createForIssueComment' });
      },
    },
    repos: {
      getCollaboratorPermissionLevel: async (args: unknown) => {
        calls.push({ args, method: 'getCollaboratorPermissionLevel' });
        if (permission === null) {
          throw new Error('Not Found');
        }
        return { data: { permission } };
      },
    },
  }) as unknown as Octokit;

const baseCtx = (octokit: Octokit, author: string): ApprovalContext => ({
  author,
  baseBranch: 'main',
  commentId: 123,
  contentsOctokit: octokit,
  octokit,
  owner: 'kubevirt-ui',
  prAuthor: 'pr-author',
  prNumber: 42,
  repo: 'kubevirt-plugin',
});

describe('applyHold', () => {
  it('rejects a non-collaborator: reacts -1, adds no label, throws', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit('read', calls);

    await assert.rejects(
      () => applyHold(baseCtx(octokit, 'random-contributor')),
      /not authorized to use \/hold/,
    );

    assert.equal(
      calls.some((call) => call.method === 'addLabels'),
      false,
    );
    const reaction = calls.find((call) => call.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '-1');
  });

  it('applies the do-not-merge/hold label for a write-access collaborator', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit('write', calls);

    await applyHold(baseCtx(octokit, 'bob-collaborator'));

    const addLabels = calls.find((call) => call.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, ['do-not-merge/hold']);
    const reaction = calls.find((call) => call.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });
});

describe('cancelHold', () => {
  it('rejects a non-collaborator: reacts -1, removes no label, throws', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit('read', calls);

    await assert.rejects(
      () => cancelHold(baseCtx(octokit, 'random-contributor')),
      /not authorized to use \/hold cancel/,
    );

    assert.equal(
      calls.some((call) => call.method === 'removeLabel'),
      false,
    );
  });

  it('removes the do-not-merge/hold label for a write-access collaborator', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit('write', calls);

    await cancelHold(baseCtx(octokit, 'bob-collaborator'));

    const removeLabel = calls.find((call) => call.method === 'removeLabel');
    assert.equal((removeLabel?.args as { name: string }).name, 'do-not-merge/hold');
    const reaction = calls.find((call) => call.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });
});
