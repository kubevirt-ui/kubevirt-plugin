import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { deleteCommentByMarker, removeLabel } from './github-comments';

type Call = { args: unknown; method: string };

const MARKER = '<!-- command-failure-summary -->';

const fakeCommentOctokit = (
  comments: { body: string; id: number; user: { type: string } }[],
  calls: Call[],
): Octokit =>
  ({
    issues: {
      deleteComment: async (args: unknown) => {
        calls.push({ args, method: 'deleteComment' });
      },
      listComments: () => undefined,
    },
    paginate: async () => comments,
  }) as unknown as Octokit;

const fakeOctokit = (behavior: 'ok' | number, calls: Call[]): Octokit =>
  ({
    issues: {
      removeLabel: async (args: unknown) => {
        calls.push({ args, method: 'removeLabel' });
        if (behavior === 'ok') {
          return;
        }
        const err = new Error(`HTTP ${behavior}`) as Error & { status: number };
        err.status = behavior;
        throw err;
      },
    },
  }) as unknown as Octokit;

describe('removeLabel', () => {
  it('succeeds when the label is present', async () => {
    const calls: Call[] = [];
    await removeLabel(fakeOctokit('ok', calls), 'kubevirt-ui', 'kubevirt-plugin', 42, 'lgtm');
    assert.equal(calls.length, 1);
    assert.equal((calls[0].args as { name: string }).name, 'lgtm');
  });

  it('treats a 404 as a no-op', async () => {
    const calls: Call[] = [];
    await assert.doesNotReject(() =>
      removeLabel(fakeOctokit(404, calls), 'kubevirt-ui', 'kubevirt-plugin', 42, 'lgtm'),
    );
    assert.equal(calls.length, 1);
  });

  it('rethrows non-404 failures (e.g. auth)', async () => {
    const calls: Call[] = [];
    await assert.rejects(
      () => removeLabel(fakeOctokit(403, calls), 'kubevirt-ui', 'kubevirt-plugin', 42, 'lgtm'),
      (err: unknown) => (err as { status?: number }).status === 403,
    );
  });

  it('rethrows network-style non-404 failures', async () => {
    const calls: Call[] = [];
    await assert.rejects(
      () => removeLabel(fakeOctokit(500, calls), 'kubevirt-ui', 'kubevirt-plugin', 42, 'lgtm'),
      (err: unknown) => (err as { status?: number }).status === 500,
    );
  });
});

describe('deleteCommentByMarker', () => {
  it('deletes the bot-authored marker comment', async () => {
    const calls: Call[] = [];
    const octokit = fakeCommentOctokit(
      [{ body: `${MARKER}\nsummary`, id: 5, user: { type: 'Bot' } }],
      calls,
    );
    await deleteCommentByMarker(octokit, 'kubevirt-ui', 'kubevirt-plugin', 42, MARKER);
    assert.equal(calls.length, 1);
    assert.equal((calls[0].args as { comment_id: number }).comment_id, 5);
  });

  it('never deletes a human comment that embeds the (public) marker', async () => {
    const calls: Call[] = [];
    const octokit = fakeCommentOctokit(
      [{ body: `look what I found: ${MARKER}`, id: 9, user: { type: 'User' } }],
      calls,
    );
    await deleteCommentByMarker(octokit, 'kubevirt-ui', 'kubevirt-plugin', 42, MARKER);
    assert.equal(calls.length, 0, 'human comment must be left untouched');
  });

  it('is a no-op when no marker comment exists', async () => {
    const calls: Call[] = [];
    await deleteCommentByMarker(fakeCommentOctokit([], calls), 'o', 'r', 42, MARKER);
    assert.equal(calls.length, 0);
  });
});
