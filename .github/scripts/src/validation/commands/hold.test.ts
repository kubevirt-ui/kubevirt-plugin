import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { ApprovalContext } from './approve';
import { applyHold, cancelHold } from './hold';

type Call = { args: unknown; method: string };

const ROOT_OWNERS = ['approvers:', '  - alice-approver', 'reviewers:', '  - bob-reviewer'].join(
  '\n',
);

const fakeLabelOctokit = (calls: Call[]): Octokit =>
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
  }) as unknown as Octokit;

const fakeContentsOctokit = (ownersContent: string, calls: Call[]): Octokit =>
  ({
    repos: {
      getContent: async (args: { path: string; ref?: string }) => {
        assert.deepEqual({ path: args.path, ref: args.ref }, { path: 'OWNERS', ref: undefined });
        return { data: { content: Buffer.from(ownersContent, 'utf8').toString('base64') } };
      },
    },
  }) as unknown as Octokit;

const baseCtx = (octokit: Octokit, contentsOctokit: Octokit, author: string): ApprovalContext => ({
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

describe('applyHold', () => {
  it('rejects someone not listed in root OWNERS: reacts -1, adds no label, throws', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit(ROOT_OWNERS, calls);

    await assert.rejects(
      () => applyHold(baseCtx(octokit, contentsOctokit, 'random-contributor')),
      /not authorized to use \/hold/,
    );

    assert.equal(
      calls.some((call) => call.method === 'addLabels'),
      false,
    );
    const reaction = calls.find((call) => call.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '-1');
  });

  it('applies the do-not-merge/hold label for a root OWNERS reviewer', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit(ROOT_OWNERS, calls);

    await applyHold(baseCtx(octokit, contentsOctokit, 'bob-reviewer'));

    const addLabels = calls.find((call) => call.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, ['do-not-merge/hold']);
    const reaction = calls.find((call) => call.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });

  it('applies the do-not-merge/hold label for a root OWNERS approver', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit(ROOT_OWNERS, calls);

    await applyHold(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const addLabels = calls.find((call) => call.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, ['do-not-merge/hold']);
  });
});

describe('cancelHold', () => {
  it('rejects someone not listed in root OWNERS: reacts -1, removes no label, throws', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit(ROOT_OWNERS, calls);

    await assert.rejects(
      () => cancelHold(baseCtx(octokit, contentsOctokit, 'random-contributor')),
      /not authorized to use \/hold cancel/,
    );

    assert.equal(
      calls.some((call) => call.method === 'removeLabel'),
      false,
    );
  });

  it('removes the do-not-merge/hold label for a root OWNERS reviewer', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit(ROOT_OWNERS, calls);

    await cancelHold(baseCtx(octokit, contentsOctokit, 'bob-reviewer'));

    const removeLabel = calls.find((call) => call.method === 'removeLabel');
    assert.equal((removeLabel?.args as { name: string }).name, 'do-not-merge/hold');
    const reaction = calls.find((call) => call.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });
});
