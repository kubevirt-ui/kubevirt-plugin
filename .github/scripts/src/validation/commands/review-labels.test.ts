import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import {
  APPROVED_LABEL as POOL_APPROVED_LABEL,
  DO_NOT_MERGE_HOLD_LABEL,
  isBlockingLabel,
  LGTM_LABEL as POOL_LGTM_LABEL,
} from '../../shared/merge-pool';
import {
  APPROVED_LABEL,
  grantApprove,
  grantHold,
  grantLgtm,
  HOLD_LABEL,
  LGTM_LABEL,
  revokeApprove,
  revokeHold,
  revokeLgtm,
} from './review-labels';

type Call = { args: unknown; method: string };

const fakeOctokit = (calls: Call[]): Octokit =>
  ({
    issues: {
      addLabels: async (args: unknown) => {
        calls.push({ args, method: 'addLabels' });
      },
      getLabel: async (args: unknown) => {
        calls.push({ args, method: 'getLabel' });
        return { data: {} };
      },
      removeLabel: async (args: unknown) => {
        calls.push({ args, method: 'removeLabel' });
      },
    },
  }) as unknown as Octokit;

describe('review-labels label names', () => {
  it('match the merge-pool TS SSOT', () => {
    assert.equal(LGTM_LABEL, POOL_LGTM_LABEL);
    assert.equal(APPROVED_LABEL, POOL_APPROVED_LABEL);
    assert.equal(HOLD_LABEL, DO_NOT_MERGE_HOLD_LABEL);
    assert.equal(isBlockingLabel(HOLD_LABEL), true);
  });
});

describe('grant/revoke helpers', () => {
  it('grantLgtm adds the lgtm label', async () => {
    const calls: Call[] = [];
    await grantLgtm(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const addLabels = calls.find((call) => call.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, [LGTM_LABEL]);
  });

  it('revokeLgtm removes the lgtm label', async () => {
    const calls: Call[] = [];
    await revokeLgtm(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const removeLabel = calls.find((call) => call.method === 'removeLabel');
    assert.equal((removeLabel?.args as { name: string }).name, LGTM_LABEL);
  });

  it('grantApprove adds the approved label', async () => {
    const calls: Call[] = [];
    await grantApprove(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const addLabels = calls.find((call) => call.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, [APPROVED_LABEL]);
  });

  it('revokeApprove removes the approved label', async () => {
    const calls: Call[] = [];
    await revokeApprove(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const removeLabel = calls.find((call) => call.method === 'removeLabel');
    assert.equal((removeLabel?.args as { name: string }).name, APPROVED_LABEL);
  });

  it('grantHold adds the do-not-merge/hold label', async () => {
    const calls: Call[] = [];
    await grantHold(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const addLabels = calls.find((call) => call.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, [HOLD_LABEL]);
  });

  it('revokeHold removes the do-not-merge/hold label', async () => {
    const calls: Call[] = [];
    await revokeHold(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const removeLabel = calls.find((call) => call.method === 'removeLabel');
    assert.equal((removeLabel?.args as { name: string }).name, HOLD_LABEL);
  });
});
