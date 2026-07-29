import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { APPROVED_LABEL, LGTM_LABEL } from '../commands/review-labels';
import { clearStaleApproval } from './clear-stale-approval';

type Call = { args: unknown; method: string };

const fakeOctokit = (calls: Call[]): Octokit =>
  ({
    issues: {
      removeLabel: async (args: unknown) => {
        calls.push({ args, method: 'removeLabel' });
      },
    },
  }) as unknown as Octokit;

describe('clearStaleApproval', () => {
  it('removes both lgtm and approved', async () => {
    const calls: Call[] = [];
    await clearStaleApproval(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);

    const removed = calls
      .filter((call) => call.method === 'removeLabel')
      .map((call) => (call.args as { name: string }).name);
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
          calls.push({ args, method: 'removeLabel' });
          if (args.name === LGTM_LABEL) {
            throw new Error('rate limit exceeded');
          }
        },
      },
    } as unknown as Octokit;

    await assert.rejects(clearStaleApproval(octokit, 'kubevirt-ui', 'kubevirt-plugin', 42));

    const removed = calls
      .filter((call) => call.method === 'removeLabel')
      .map((call) => (call.args as { name: string }).name);
    assert.deepEqual(
      [...removed].sort((left: string, right: string) => left.localeCompare(right)),
      [APPROVED_LABEL, LGTM_LABEL].sort((left: string, right: string) => left.localeCompare(right)),
    );
  });
});
