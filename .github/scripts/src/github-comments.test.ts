import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { removeLabel } from './github-comments';

type Call = { method: string; args: unknown };

const fakeOctokit = (behavior: 'ok' | number, calls: Call[]): Octokit =>
  ({
    issues: {
      removeLabel: async (args: unknown) => {
        calls.push({ method: 'removeLabel', args });
        if (behavior === 'ok') return;
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
