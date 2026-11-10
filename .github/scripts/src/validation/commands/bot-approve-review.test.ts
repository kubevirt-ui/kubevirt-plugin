import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { dispatchAutoMerge, ensureBotApprovingReview } from './bot-approve-review';

type Call = { args: unknown; method: string };

const fakeOctokit = (calls: Call[], reviews: unknown[] = []): Octokit =>
  ({
    actions: {
      createWorkflowDispatch: async (args: unknown) => {
        calls.push({ args, method: 'createWorkflowDispatch' });
      },
    },
    issues: {
      createComment: async (args: unknown) => {
        calls.push({ args, method: 'createComment' });
      },
    },
    paginate: {
      iterator: async function* () {
        yield { data: reviews };
      },
    },
    pulls: {
      createReview: async (args: unknown) => {
        calls.push({ args, method: 'createReview' });
        return { data: {} };
      },
      listReviews: async () => ({ data: reviews }),
    },
  }) as unknown as Octokit;

describe('ensureBotApprovingReview', () => {
  it('submits APPROVE when no approving review exists', async () => {
    const calls: Call[] = [];
    const result = await ensureBotApprovingReview(fakeOctokit(calls), {
      author: 'alice',
      command: '/lgtm',
      headSha: 'deadbeef',
      owner: 'kubevirt-ui',
      prNumber: 42,
      repo: 'kubevirt-plugin',
    });

    assert.equal(result, 'approved');
    const review = calls.find((c) => c.method === 'createReview');
    assert.equal((review?.args as { event: string }).event, 'APPROVE');
    assert.match((review?.args as { body: string }).body, /@alice via `\/lgtm`/);
  });

  it('skips createReview when an approving review already exists', async () => {
    const calls: Call[] = [];
    const result = await ensureBotApprovingReview(
      fakeOctokit(calls, [{ state: 'APPROVED', user: { login: 'bob' } }]),
      {
        author: 'alice',
        command: '/approve',
        headSha: 'deadbeef',
        owner: 'kubevirt-ui',
        prNumber: 42,
        repo: 'kubevirt-plugin',
      },
    );

    assert.equal(result, 'already-approved');
    assert.equal(
      calls.some((c) => c.method === 'createReview'),
      false,
    );
  });

  it('soft-fails with a warning comment when createReview throws', async () => {
    const calls: Call[] = [];
    const octokit = {
      issues: {
        createComment: async (args: unknown) => {
          calls.push({ args, method: 'createComment' });
        },
      },
      paginate: {
        iterator: async function* () {
          yield { data: [] };
        },
      },
      pulls: {
        createReview: async () => {
          throw new Error('Reviewers must have write access');
        },
        listReviews: async () => ({ data: [] }),
      },
    } as unknown as Octokit;

    const result = await ensureBotApprovingReview(octokit, {
      author: 'alice',
      command: '/lgtm',
      headSha: 'deadbeef',
      owner: 'kubevirt-ui',
      prNumber: 42,
      repo: 'kubevirt-plugin',
    });

    assert.equal(result, 'failed');
    assert.equal(
      calls.some((c) => c.method === 'createComment'),
      true,
    );
  });
});

describe('dispatchAutoMerge', () => {
  it('dispatches auto-merge.yml on main with pr inputs', async () => {
    const calls: Call[] = [];
    await dispatchAutoMerge(fakeOctokit(calls), {
      headSha: 'deadbeef',
      owner: 'kubevirt-ui',
      prNumber: 42,
      repo: 'kubevirt-plugin',
    });

    const dispatch = calls.find((c) => c.method === 'createWorkflowDispatch');
    assert.deepEqual(dispatch?.args, {
      inputs: { pr_head_sha: 'deadbeef', pr_number: '42' },
      owner: 'kubevirt-ui',
      ref: 'main',
      repo: 'kubevirt-plugin',
      workflow_id: 'auto-merge.yml',
    });
  });
});
