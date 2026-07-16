import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { clearStaleApproval } from './clear-stale-approval';
import { APPROVED_LABEL, LGTM_LABEL } from '../commands/review-labels';

type Call = { method: string; args: unknown };

const fakeOctokit = (calls: Call[]): Octokit =>
  ({
    issues: {
      removeLabel: async (args: unknown) => {
        calls.push({ method: 'removeLabel', args });
      },
    },
  }) as unknown as Octokit;

describe('clearStaleApproval', () => {
  it('removes both lgtm and approved', async () => {
    const calls: Call[] = [];
    await clearStaleApproval(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);

    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed, [LGTM_LABEL, APPROVED_LABEL]);
  });

  it('is idempotent when neither label is present -- removeLabel no-ops on 404', async () => {
    const octokit = {
      issues: {
        removeLabel: async () => {
          const err = new Error('Not Found') as Error & { status: number };
          err.status = 404;
          throw err;
        },
      },
    } as unknown as Octokit;

    await assert.doesNotReject(clearStaleApproval(octokit, 'kubevirt-ui', 'kubevirt-plugin', 42));
  });

  it('propagates a genuine failure (not a missing label)', async () => {
    const octokit = {
      issues: {
        removeLabel: async () => {
          throw new Error('rate limit exceeded');
        },
      },
    } as unknown as Octokit;

    await assert.rejects(clearStaleApproval(octokit, 'kubevirt-ui', 'kubevirt-plugin', 42));
  });

  it('still attempts to remove approved even when removing lgtm fails -- the two revokes must not short-circuit each other', async () => {
    const calls: Call[] = [];
    const octokit = {
      issues: {
        removeLabel: async (args: { name: string }) => {
          calls.push({ method: 'removeLabel', args });
          if (args.name === LGTM_LABEL) {
            throw new Error('rate limit exceeded');
          }
        },
      },
    } as unknown as Octokit;

    await assert.rejects(clearStaleApproval(octokit, 'kubevirt-ui', 'kubevirt-plugin', 42));

    const removed = calls
      .filter((c) => c.method === 'removeLabel')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), [APPROVED_LABEL, LGTM_LABEL].sort());
  });
});
