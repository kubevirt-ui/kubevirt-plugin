import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { applyLgtm, cancelLgtm } from './lgtm';
import type { ReviewContext } from './lgtm';

const OWNERS_CONTENT = ['approvers:', '  - alice-approver'].join('\n');

type Call = { method: string; args: unknown };

type FakeOptions = {
  permission: string | null;
  ownersContent?: string | null;
};

const fakeOctokit = ({ permission, ownersContent = null }: FakeOptions, calls: Call[]): Octokit =>
  ({
    repos: {
      getCollaboratorPermissionLevel: async (args: unknown) => {
        calls.push({ method: 'getCollaboratorPermissionLevel', args });
        if (permission === null) throw new Error('Not Found');
        return { data: { permission } };
      },
      getContent: async (args: unknown) => {
        calls.push({ method: 'getContent', args });
        if (ownersContent === null) throw new Error('Not Found');
        return { data: { content: Buffer.from(ownersContent, 'utf8').toString('base64') } };
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

const baseCtx = (octokit: Octokit, contentsOctokit: Octokit, author: string): ReviewContext => ({
  octokit,
  contentsOctokit,
  owner: 'kubevirt-ui',
  repo: 'kubevirt-plugin',
  prNumber: 42,
  baseBranch: 'main',
  author,
  commentId: 123,
  prAuthor: 'pr-author',
});

describe('applyLgtm', () => {
  it('rejects the PR author lgtm-ing their own PR: reacts -1, adds no label, throws', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write' }, calls);
    const contentsOctokit = fakeOctokit({ permission: 'write' }, calls);

    await assert.rejects(
      () => applyLgtm(baseCtx(octokit, contentsOctokit, 'pr-author')),
      /not authorized to use \/lgtm/,
    );

    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
    const reaction = calls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '-1');
  });

  it('rejects self-lgtm when author and prAuthor differ only by case', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write' }, calls);
    const contentsOctokit = fakeOctokit({ permission: 'write' }, calls);

    await assert.rejects(
      () =>
        applyLgtm({
          ...baseCtx(octokit, contentsOctokit, 'PR-Author'),
          prAuthor: 'pr-author',
        }),
      /not authorized to use \/lgtm/,
    );

    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
    const reaction = calls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '-1');
  });

  it('rejects a non-collaborator: reacts -1, adds no label, throws', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'read' }, calls);
    const contentsOctokit = fakeOctokit({ permission: 'read' }, calls);

    await assert.rejects(
      () => applyLgtm(baseCtx(octokit, contentsOctokit, 'random-contributor')),
      /not authorized to use \/lgtm/,
    );

    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('grants lgtm only (not approved) for a write-collaborator who is not an OWNERS approver', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write' }, calls);
    const contentsOctokit = fakeOctokit(
      { permission: 'write', ownersContent: OWNERS_CONTENT },
      calls,
    );

    await applyLgtm(baseCtx(octokit, contentsOctokit, 'bob-collaborator'));

    const addLabelsCalls = calls.filter((c) => c.method === 'addLabels');
    assert.deepEqual(
      addLabelsCalls.map((c) => (c.args as { labels: string[] }).labels[0]),
      ['lgtm'],
    );
    const reaction = calls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });

  it('lgtm-acts-as-approve: grants both lgtm and approved for a write-collaborator who is also a root-OWNERS approver', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write' }, calls);
    const contentsOctokit = fakeOctokit(
      { permission: 'write', ownersContent: OWNERS_CONTENT },
      calls,
    );

    await applyLgtm(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const addLabelsCalls = calls.filter((c) => c.method === 'addLabels');
    assert.deepEqual(addLabelsCalls.map((c) => (c.args as { labels: string[] }).labels[0]).sort(), [
      'approved',
      'lgtm',
    ]);
  });

  it('reads OWNERS via contentsOctokit at the root OWNERS path, not .github/OWNERS', async () => {
    const calls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write' }, calls);
    const contentsOctokit = fakeOctokit(
      { permission: 'write', ownersContent: OWNERS_CONTENT },
      contentsCalls,
    );

    await applyLgtm(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const getContentCall = contentsCalls.find((c) => c.method === 'getContent');
    assert.equal((getContentCall?.args as { path: string }).path, 'OWNERS');
  });
});

describe('cancelLgtm', () => {
  it('allows the PR author to cancel their own lgtm, and revokes approved too', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: null }, calls);
    const contentsOctokit = fakeOctokit({ permission: null }, calls);

    await cancelLgtm(baseCtx(octokit, contentsOctokit, 'pr-author'));

    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });

  it('allows any write-access collaborator to cancel, and always revokes approved too -- approved must not outlive the lgtm that justified it just because a non-approver is the one cancelling', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write' }, calls);
    const contentsOctokit = fakeOctokit({ permission: 'write' }, calls);

    await cancelLgtm(baseCtx(octokit, contentsOctokit, 'bob-collaborator'));

    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });

  it('OWNERS cancel also revokes approved (mirrors lgtm-acts-as-approve)', async () => {
    const calls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write', ownersContent: OWNERS_CONTENT }, calls);
    const contentsOctokit = fakeOctokit(
      { permission: 'write', ownersContent: OWNERS_CONTENT },
      contentsCalls,
    );

    await cancelLgtm(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });

  it('rejects a non-collaborator, non-author: reacts -1, throws', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'read' }, calls);
    const contentsOctokit = fakeOctokit({ permission: 'read' }, calls);

    await assert.rejects(
      () => cancelLgtm(baseCtx(octokit, contentsOctokit, 'random-contributor')),
      /not authorized to use \/lgtm cancel/,
    );

    assert.equal(
      calls.some((c) => c.method === 'removeLabel'),
      false,
    );
  });
});
