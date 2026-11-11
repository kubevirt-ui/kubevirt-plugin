import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { ReviewContext } from './lgtm';
import { applyLgtm, cancelLgtm } from './lgtm';

const OWNERS_CONTENT = ['approvers:', '  - alice-approver', 'reviewers:', '  - bob-reviewer'].join(
  '\n',
);

type Call = { args: unknown; method: string };

type FakeOptions = {
  ownersContent?: null | string;
};

const fakeOctokit = ({ ownersContent = null }: FakeOptions, calls: Call[]): Octokit =>
  ({
    actions: {
      createWorkflowDispatch: async (args: unknown) => {
        calls.push({ args, method: 'createWorkflowDispatch' });
      },
    },
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
    paginate: {
      iterator: async function* () {
        yield { data: [] };
      },
    },
    pulls: {
      createReview: async (args: unknown) => {
        calls.push({ args, method: 'createReview' });
      },
      listReviews: async () => ({ data: [] }),
    },
    reactions: {
      createForIssueComment: async (args: unknown) => {
        calls.push({ args, method: 'createForIssueComment' });
      },
    },
    repos: {
      getContent: async (args: unknown) => {
        calls.push({ args, method: 'getContent' });
        if (ownersContent === null) throw new Error('Not Found');
        return { data: { content: Buffer.from(ownersContent, 'utf8').toString('base64') } };
      },
    },
  }) as unknown as Octokit;

const baseCtx = (octokit: Octokit, contentsOctokit: Octokit, author: string): ReviewContext => ({
  author,
  baseBranch: 'main',
  commentId: 123,
  contentsOctokit,
  headSha: 'abc123headsha',
  octokit,
  owner: 'kubevirt-ui',
  prAuthor: 'pr-author',
  prNumber: 42,
  repo: 'kubevirt-plugin',
});

describe('applyLgtm', () => {
  it('rejects the PR author lgtm-ing their own PR: reacts -1, adds no label, throws', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({}, calls);
    const contentsOctokit = fakeOctokit({}, calls);

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
    const octokit = fakeOctokit({}, calls);
    const contentsOctokit = fakeOctokit({}, calls);

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

  it('rejects someone not listed in root OWNERS: reacts -1, adds no label, throws', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({}, calls);
    const contentsOctokit = fakeOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    await assert.rejects(
      () => applyLgtm(baseCtx(octokit, contentsOctokit, 'random-contributor')),
      /not authorized to use \/lgtm/,
    );

    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('grants lgtm only (not approved) for a root OWNERS reviewer', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({}, calls);
    const contentsOctokit = fakeOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    await applyLgtm(baseCtx(octokit, contentsOctokit, 'bob-reviewer'));

    const addLabelsCalls = calls.filter((c) => c.method === 'addLabels');
    assert.deepEqual(
      addLabelsCalls.map((c) => (c.args as { labels: string[] }).labels[0]),
      ['lgtm'],
    );
    const reaction = calls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });

  it('lgtm-acts-as-approve: grants both lgtm and approved for a root OWNERS approver', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({}, calls);
    const contentsOctokit = fakeOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    await applyLgtm(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const addLabelsCalls = calls.filter((c) => c.method === 'addLabels');
    assert.deepEqual(addLabelsCalls.map((c) => (c.args as { labels: string[] }).labels[0]).sort(), [
      'approved',
      'lgtm',
    ]);
    assert.equal(
      calls.some((c) => c.method === 'createReview'),
      true,
    );
    assert.equal(
      calls.some((c) => c.method === 'createWorkflowDispatch'),
      true,
    );
  });

  it('does not bot-APPROVE or dispatch Auto Merge for a root OWNERS reviewer', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({}, calls);
    const contentsOctokit = fakeOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    await applyLgtm(baseCtx(octokit, contentsOctokit, 'bob-reviewer'));

    assert.equal(
      calls.some((c) => c.method === 'createReview'),
      false,
    );
    assert.equal(
      calls.some((c) => c.method === 'createWorkflowDispatch'),
      false,
    );
  });

  it('reads OWNERS via contentsOctokit at the root OWNERS path, not .github/OWNERS', async () => {
    const calls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit({}, calls);
    const contentsOctokit = fakeOctokit({ ownersContent: OWNERS_CONTENT }, contentsCalls);

    await applyLgtm(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const getContentCalls = contentsCalls.filter((c) => c.method === 'getContent');
    assert.deepEqual(
      getContentCalls.map(({ args }) => {
        const { path, ref } = args as { path: string; ref?: string };
        return { path, ref };
      }),
      [
        { path: 'OWNERS', ref: undefined },
        { path: 'OWNERS', ref: 'main' },
      ],
    );
  });
});

describe('cancelLgtm', () => {
  it('allows the PR author to cancel their own lgtm, and revokes approved too', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({}, calls);
    const contentsOctokit = fakeOctokit({}, calls);

    await cancelLgtm(baseCtx(octokit, contentsOctokit, 'pr-author'));

    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });

  it('allows a root OWNERS reviewer to cancel and always revokes approved too', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({}, calls);
    const contentsOctokit = fakeOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    await cancelLgtm(baseCtx(octokit, contentsOctokit, 'bob-reviewer'));

    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });

  it('OWNERS cancel also revokes approved (mirrors lgtm-acts-as-approve)', async () => {
    const calls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit({ ownersContent: OWNERS_CONTENT }, calls);
    const contentsOctokit = fakeOctokit({ ownersContent: OWNERS_CONTENT }, contentsCalls);

    await cancelLgtm(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });

  it('rejects a non-OWNERS member who is not the PR author: reacts -1, throws', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({}, calls);
    const contentsOctokit = fakeOctokit({ ownersContent: OWNERS_CONTENT }, calls);

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
