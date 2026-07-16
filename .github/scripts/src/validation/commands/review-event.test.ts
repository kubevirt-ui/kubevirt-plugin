import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { syncLabelsFromReview } from './review-event';

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
      getLabel: async () => ({ data: {} }),
      addLabels: async (args: unknown) => {
        calls.push({ method: 'addLabels', args });
      },
      removeLabel: async (args: unknown) => {
        calls.push({ method: 'removeLabel', args });
      },
    },
  }) as unknown as Octokit;

describe('syncLabelsFromReview', () => {
  it('skips self-reviews without touching labels', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write', ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      octokit,
      contentsOctokit: octokit,
      owner: 'kubevirt-ui',
      repo: 'kubevirt-plugin',
      prNumber: 42,
      baseBranch: 'main',
      reviewState: 'APPROVED',
      reviewAuthor: 'pr-author',
      prAuthor: 'pr-author',
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
      octokit,
      contentsOctokit: octokit,
      owner: 'kubevirt-ui',
      repo: 'kubevirt-plugin',
      prNumber: 42,
      baseBranch: 'main',
      reviewState: 'APPROVED',
      reviewAuthor: 'outsider',
      prAuthor: 'pr-author',
    });

    assert.equal(result, 'skipped');
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('Approve from a write collaborator grants lgtm only', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write', ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      octokit,
      contentsOctokit: octokit,
      owner: 'kubevirt-ui',
      repo: 'kubevirt-plugin',
      prNumber: 42,
      baseBranch: 'main',
      reviewState: 'APPROVED',
      reviewAuthor: 'bob-collaborator',
      prAuthor: 'pr-author',
    });

    assert.equal(result, 'applied');
    const labels = calls
      .filter((c) => c.method === 'addLabels')
      .flatMap((c) => (c.args as { labels: string[] }).labels);
    assert.deepEqual(labels, ['lgtm']);
  });

  it('Approve from a root OWNERS approver grants lgtm and approved', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write', ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      octokit,
      contentsOctokit: octokit,
      owner: 'kubevirt-ui',
      repo: 'kubevirt-plugin',
      prNumber: 42,
      baseBranch: 'main',
      reviewState: 'APPROVED',
      reviewAuthor: 'alice-approver',
      prAuthor: 'pr-author',
    });

    assert.equal(result, 'applied');
    const labels = calls
      .filter((c) => c.method === 'addLabels')
      .flatMap((c) => (c.args as { labels: string[] }).labels);
    assert.deepEqual(labels.sort(), ['approved', 'lgtm']);
  });

  it('Request changes from an OWNERS approver revokes lgtm and approved', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'write', ownersContent: OWNERS_CONTENT }, calls);

    const result = await syncLabelsFromReview({
      octokit,
      contentsOctokit: octokit,
      owner: 'kubevirt-ui',
      repo: 'kubevirt-plugin',
      prNumber: 42,
      baseBranch: 'main',
      reviewState: 'CHANGES_REQUESTED',
      reviewAuthor: 'alice-approver',
      prAuthor: 'pr-author',
    });

    assert.equal(result, 'revoked');
    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), ['approved', 'lgtm']);
  });
});
