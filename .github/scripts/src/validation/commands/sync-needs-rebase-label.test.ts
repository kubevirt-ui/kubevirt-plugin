import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { COMMENT_MARKER, NEEDS_REBASE_LABEL, syncNeedsRebaseLabel } from '../../merge/needs-rebase';

type Call = { args: unknown; method: string };

const fakeOctokit = (opts: {
  createLabelStatus?: number;
  existingComments?: string[];
  getLabelStatus?: number;
  labels?: string[];
  mergeable: boolean | null;
}) => {
  const calls: Call[] = [];
  const labels = opts.labels ?? [];
  const comments = (opts.existingComments ?? []).map((body, i) => ({ body, id: i + 1 }));

  const listComments = async () => ({ data: comments });

  const octokit = {
    issues: {
      addLabels: async (args: unknown) => {
        calls.push({ args, method: 'addLabels' });
      },
      createComment: async (args: unknown) => {
        calls.push({ args, method: 'createComment' });
      },
      createLabel: async (args: unknown) => {
        calls.push({ args, method: 'createLabel' });
        if (opts.createLabelStatus === 422) {
          const err = new Error('already_exists') as Error & { status: number };
          err.status = 422;
          throw err;
        }
      },
      deleteComment: async (args: unknown) => {
        calls.push({ args, method: 'deleteComment' });
      },
      getLabel: async (args: unknown) => {
        calls.push({ args, method: 'getLabel' });
        if (opts.getLabelStatus === 404) {
          const err = new Error('Not Found') as Error & { status: number };
          err.status = 404;
          throw err;
        }
        return { data: {} };
      },
      listComments,
      removeLabel: async (args: unknown) => {
        calls.push({ args, method: 'removeLabel' });
      },
    },
    paginate: async (fn: unknown) => {
      if (fn === listComments) return comments;
      return [];
    },
    pulls: {
      get: async (args: unknown) => {
        calls.push({ args, method: 'pulls.get' });
        return {
          data: {
            base: { ref: 'main' },
            labels: labels.map((name) => ({ name })),
            mergeable: opts.mergeable,
            user: { login: 'pr-author' },
          },
        };
      },
    },
  } as unknown as Octokit;

  return { calls, octokit };
};

describe('syncNeedsRebaseLabel', () => {
  it('skips when mergeable is still null', async () => {
    const { calls, octokit } = fakeOctokit({ mergeable: null });
    await syncNeedsRebaseLabel({
      octokit,
      owner: 'kubevirt-ui',
      prNumber: 42,
      repo: 'kubevirt-plugin',
    });
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
    assert.equal(
      calls.some((c) => c.method === 'createComment'),
      false,
    );
  });

  it('applies label + comment on first conflict', async () => {
    const { calls, octokit } = fakeOctokit({ getLabelStatus: 404, mergeable: false });
    await syncNeedsRebaseLabel({
      octokit,
      owner: 'kubevirt-ui',
      prNumber: 42,
      repo: 'kubevirt-plugin',
    });

    assert.equal(
      calls.some((c) => c.method === 'createLabel'),
      true,
    );
    assert.deepEqual(
      (calls.find((c) => c.method === 'addLabels')?.args as { labels: string[] }).labels,
      [NEEDS_REBASE_LABEL],
    );
    const comment = calls.find((c) => c.method === 'createComment');
    assert.ok(((comment?.args as { body: string }).body || '').includes(COMMENT_MARKER));
  });

  it('tolerates 422 already_exists when creating the label', async () => {
    const { calls, octokit } = fakeOctokit({
      createLabelStatus: 422,
      getLabelStatus: 404,
      mergeable: false,
    });
    await syncNeedsRebaseLabel({
      octokit,
      owner: 'kubevirt-ui',
      prNumber: 42,
      repo: 'kubevirt-plugin',
    });
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      true,
    );
  });

  it('does not re-comment when the marker is already present', async () => {
    const { calls, octokit } = fakeOctokit({
      existingComments: [`${COMMENT_MARKER}\n\nalready told you`],
      labels: [NEEDS_REBASE_LABEL],
      mergeable: false,
    });
    await syncNeedsRebaseLabel({
      octokit,
      owner: 'kubevirt-ui',
      prNumber: 42,
      repo: 'kubevirt-plugin',
    });
    assert.equal(
      calls.some((c) => c.method === 'createComment'),
      false,
    );
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('removes the label and marker comments when mergeable becomes true', async () => {
    const { calls, octokit } = fakeOctokit({
      existingComments: [`${COMMENT_MARKER}\n\nalready told you`],
      labels: [NEEDS_REBASE_LABEL],
      mergeable: true,
    });
    await syncNeedsRebaseLabel({
      octokit,
      owner: 'kubevirt-ui',
      prNumber: 42,
      repo: 'kubevirt-plugin',
    });
    assert.equal(
      (calls.find((c) => c.method === 'removeLabel')?.args as { name: string }).name,
      NEEDS_REBASE_LABEL,
    );
    assert.equal(
      calls.some((c) => c.method === 'deleteComment'),
      true,
    );
  });
});
