import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { ApprovalContext } from './approve';
import { applyHold, cancelHold } from './hold';

type Call = { method: string; args: unknown };

const fakeOctokit = (permission: string | null, calls: Call[]): Octokit =>
  ({
    repos: {
      getCollaboratorPermissionLevel: async (args: unknown) => {
        calls.push({ method: 'getCollaboratorPermissionLevel', args });
        if (permission === null) throw new Error('Not Found');
        return { data: { permission } };
      },
    },
    issues: {
      getLabel: async (args: unknown) => {
        calls.push({ method: 'getLabel', args });
        return { data: {} };
      },
      addLabels: async (args: unknown) => {
        calls.push({ method: 'addLabels', args });
      },
      removeLabel: async (args: unknown) => {
        calls.push({ method: 'removeLabel', args });
      },
      createComment: async (args: unknown) => {
        calls.push({ method: 'createComment', args });
      },
    },
    reactions: {
      createForIssueComment: async (args: unknown) => {
        calls.push({ method: 'createForIssueComment', args });
      },
    },
  }) as unknown as Octokit;

const baseCtx = (octokit: Octokit, author: string): ApprovalContext => ({
  octokit,
  contentsOctokit: octokit,
  owner: 'kubevirt-ui',
  repo: 'kubevirt-plugin',
  prNumber: 42,
  baseBranch: 'main',
  author,
  commentId: 123,
  prAuthor: 'pr-author',
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
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
    const reaction = calls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '-1');
  });

  it('applies the do-not-merge/hold label for a write-access collaborator', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit('write', calls);

    await applyHold(baseCtx(octokit, 'bob-collaborator'));

    const addLabels = calls.find((c) => c.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, ['do-not-merge/hold']);
    const reaction = calls.find((c) => c.method === 'createForIssueComment');
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
      calls.some((c) => c.method === 'removeLabel'),
      false,
    );
  });

  it('removes the do-not-merge/hold label for a write-access collaborator', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit('write', calls);

    await cancelHold(baseCtx(octokit, 'bob-collaborator'));

    const removeLabel = calls.find((c) => c.method === 'removeLabel');
    assert.equal((removeLabel?.args as { name: string }).name, 'do-not-merge/hold');
    const reaction = calls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });
});
