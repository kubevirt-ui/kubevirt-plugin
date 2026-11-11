import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { syncLabelsFromReview } from './review-event';

const OWNERS_CONTENT = ['approvers:', '  - alice-approver', 'reviewers:', '  - bob-reviewer'].join(
  '\n',
);

type Call = { args: unknown; method: string };

type FakeOptions = {
  ownersContent?: null | string;
};

const fakeLabelOctokit = (calls: Call[]): Octokit =>
  ({
    issues: {
      addLabels: async (args: unknown) => {
        calls.push({ args, method: 'addLabels' });
      },
      getLabel: async () => ({ data: {} }),
      removeLabel: async (args: unknown) => {
        calls.push({ args, method: 'removeLabel' });
      },
    },
  }) as unknown as Octokit;

const fakeContentsOctokit = ({ ownersContent = null }: FakeOptions, calls: Call[]): Octokit =>
  ({
    repos: {
      getContent: async (args: { path: string; ref?: string }) => {
        assert.equal(args.path, 'OWNERS');
        calls.push({ args, method: 'getContent' });
        if (ownersContent === null) throw new Error('Not Found');
        return { data: { content: Buffer.from(ownersContent, 'utf8').toString('base64') } };
      },
    },
  }) as unknown as Octokit;

describe('syncLabelsFromReview', () => {
  it('skips self-reviews without touching labels', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      contentsOctokit,
      octokit,
      owner: 'kubevirt-ui',
      prAuthor: 'pr-author',
      prNumber: 42,
      repo: 'kubevirt-plugin',
      reviewAuthor: 'pr-author',
      reviewState: 'APPROVED',
    });

    assert.equal(result, 'skipped');
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('skips reviewers not listed in root OWNERS without touching labels', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      contentsOctokit,
      octokit,
      owner: 'kubevirt-ui',
      prAuthor: 'pr-author',
      prNumber: 42,
      repo: 'kubevirt-plugin',
      reviewAuthor: 'outsider',
      reviewState: 'APPROVED',
    });

    assert.equal(result, 'skipped');
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('skips request-changes reviews from someone not listed in root OWNERS', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      contentsOctokit,
      octokit,
      owner: 'kubevirt-ui',
      prAuthor: 'pr-author',
      prNumber: 42,
      repo: 'kubevirt-plugin',
      reviewAuthor: 'outsider',
      reviewState: 'CHANGES_REQUESTED',
    });

    assert.equal(result, 'skipped');
    assert.equal(
      calls.some((c) => c.method === 'removeLabel'),
      false,
    );
  });

  it('revokes lgtm and approved when OWNERS lookup fails for a request-changes review', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit({ ownersContent: null }, calls);

    await assert.rejects(
      () =>
        syncLabelsFromReview({
          contentsOctokit,
          octokit,
          owner: 'kubevirt-ui',
          prAuthor: 'pr-author',
          prNumber: 42,
          repo: 'kubevirt-plugin',
          reviewAuthor: 'bob-reviewer',
          reviewState: 'CHANGES_REQUESTED',
        }),
      /Not Found/,
    );

    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });

  it('does not grant labels when OWNERS lookup fails for an approving review', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit({ ownersContent: null }, calls);

    await assert.rejects(
      () =>
        syncLabelsFromReview({
          contentsOctokit,
          octokit,
          owner: 'kubevirt-ui',
          prAuthor: 'pr-author',
          prNumber: 42,
          repo: 'kubevirt-plugin',
          reviewAuthor: 'bob-reviewer',
          reviewState: 'APPROVED',
        }),
      /Not Found/,
    );

    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('Approve from a root OWNERS reviewer grants lgtm only', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      contentsOctokit,
      octokit,
      owner: 'kubevirt-ui',
      prAuthor: 'pr-author',
      prNumber: 42,
      repo: 'kubevirt-plugin',
      reviewAuthor: 'bob-reviewer',
      reviewState: 'APPROVED',
    });

    assert.equal(result, 'applied');
    const labels = calls
      .filter((c) => c.method === 'addLabels')
      .flatMap((c) => (c.args as { labels: string[] }).labels);
    assert.deepEqual(labels, ['lgtm']);
  });

  it('Approve from a root OWNERS approver grants lgtm and approved', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      contentsOctokit,
      octokit,
      owner: 'kubevirt-ui',
      prAuthor: 'pr-author',
      prNumber: 42,
      repo: 'kubevirt-plugin',
      reviewAuthor: 'alice-approver',
      reviewState: 'APPROVED',
    });

    assert.equal(result, 'applied');
    const labels = calls
      .filter((c) => c.method === 'addLabels')
      .flatMap((c) => (c.args as { labels: string[] }).labels);
    assert.deepEqual(labels.sort(), ['approved', 'lgtm']);
    const getContentCalls = calls.filter((call) => call.method === 'getContent');
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

  it('Request changes from an OWNERS approver revokes lgtm and approved', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      contentsOctokit,
      octokit,
      owner: 'kubevirt-ui',
      prAuthor: 'pr-author',
      prNumber: 42,
      repo: 'kubevirt-plugin',
      reviewAuthor: 'alice-approver',
      reviewState: 'CHANGES_REQUESTED',
    });

    assert.equal(result, 'revoked');
    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });

  it('Request changes from a root OWNERS reviewer still revokes both lgtm and approved', async () => {
    const calls: Call[] = [];
    const octokit = fakeLabelOctokit(calls);
    const contentsOctokit = fakeContentsOctokit({ ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      contentsOctokit,
      octokit,
      owner: 'kubevirt-ui',
      prAuthor: 'pr-author',
      prNumber: 42,
      repo: 'kubevirt-plugin',
      reviewAuthor: 'bob-reviewer',
      reviewState: 'CHANGES_REQUESTED',
    });

    assert.equal(result, 'revoked');
    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });
});
