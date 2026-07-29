import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { syncLabelsFromReview } from './review-event';

const OWNERS_CONTENT = ['approvers:', '  - alice-approver'].join('\n');

type Call = { args: unknown; method: string };

type FakeOptions = {
  ownersContent?: null | string;
  permission: null | string;
};

const fakeOctokit = ({ ownersContent = null, permission }: FakeOptions, calls: Call[]): Octokit =>
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
    repos: {
      getCollaboratorPermissionLevel: async (args: unknown) => {
        calls.push({ args, method: 'getCollaboratorPermissionLevel' });
        if (permission === null) throw new Error('Not Found');
        return { data: { permission } };
      },
      getContent: async (args: unknown) => {
        calls.push({ args, method: 'getContent' });
        if (ownersContent === null) throw new Error('Not Found');
        return { data: { content: Buffer.from(ownersContent, 'utf8').toString('base64') } };
      },
    },
  }) as unknown as Octokit;

describe('syncLabelsFromReview', () => {
  it('skips self-reviews without touching labels', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ ownersContent: OWNERS_CONTENT, permission: 'write' }, calls);

    const result = await syncLabelsFromReview({
      baseBranch: 'main',
      contentsOctokit: octokit,
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

  it('skips non-collaborators without touching labels', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'read' }, calls);

    const result = await syncLabelsFromReview({
      baseBranch: 'main',
      contentsOctokit: octokit,
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

  it('Approve from a write collaborator grants lgtm only', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ ownersContent: OWNERS_CONTENT, permission: 'write' }, calls);

    const result = await syncLabelsFromReview({
      baseBranch: 'main',
      contentsOctokit: octokit,
      octokit,
      owner: 'kubevirt-ui',
      prAuthor: 'pr-author',
      prNumber: 42,
      repo: 'kubevirt-plugin',
      reviewAuthor: 'bob-collaborator',
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
    const octokit = fakeOctokit({ ownersContent: OWNERS_CONTENT, permission: 'write' }, calls);

    const result = await syncLabelsFromReview({
      baseBranch: 'main',
      contentsOctokit: octokit,
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
  });

  it('Request changes from an OWNERS approver revokes lgtm and approved', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ ownersContent: OWNERS_CONTENT, permission: 'write' }, calls);

    const result = await syncLabelsFromReview({
      baseBranch: 'main',
      contentsOctokit: octokit,
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

  it('Request changes from a write collaborator who is not an OWNERS approver still revokes both lgtm and approved -- approved must not outlive the lgtm that justified it', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ ownersContent: OWNERS_CONTENT, permission: 'write' }, calls);

    const result = await syncLabelsFromReview({
      baseBranch: 'main',
      contentsOctokit: octokit,
      octokit,
      owner: 'kubevirt-ui',
      prAuthor: 'pr-author',
      prNumber: 42,
      repo: 'kubevirt-plugin',
      reviewAuthor: 'bob-collaborator',
      reviewState: 'CHANGES_REQUESTED',
    });

    assert.equal(result, 'revoked');
    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });
});
