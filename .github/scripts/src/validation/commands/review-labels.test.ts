import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';

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
import type { Octokit } from '@octokit/rest';

type Call = { method: string; args: unknown };

const require = createRequire(__filename);
const poolLabels = require(
  path.join(__dirname, '../../../../../ci-scripts/hot-cluster/js/merge-pool-labels.cjs'),
) as {
  LGTM_LABEL: string;
  APPROVED_LABEL: string;
  DO_NOT_MERGE_HOLD_LABEL: string;
  isBlockingLabel: (name: string) => boolean;
};

const fakeOctokit = (calls: Call[]): Octokit =>
  ({
    issues: {
      getLabel: async (args: unknown) => {
        calls.push({ method: 'getLabel', args });
        return { data: {} };
      },
      addLabels: async (args: unknown) => {
        calls.push({ method: 'addLabels', args });
      },
      removeLabel: async (args: unknown) => {
        calls.push({ method: 'removeLabel', args });
      },
    },
  }) as unknown as Octokit;

describe('review-labels label names', () => {
  it('match the CJS merge-pool-labels SSOT', () => {
    assert.equal(LGTM_LABEL, poolLabels.LGTM_LABEL);
    assert.equal(APPROVED_LABEL, poolLabels.APPROVED_LABEL);
    assert.equal(HOLD_LABEL, poolLabels.DO_NOT_MERGE_HOLD_LABEL);
    assert.equal(poolLabels.isBlockingLabel(HOLD_LABEL), true);
  });
});

describe('grant/revoke helpers', () => {
  it('grantLgtm adds the lgtm label', async () => {
    const calls: Call[] = [];
    await grantLgtm(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const addLabels = calls.find((c) => c.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, [LGTM_LABEL]);
  });

  it('revokeLgtm removes the lgtm label', async () => {
    const calls: Call[] = [];
    await revokeLgtm(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const removeLabel = calls.find((c) => c.method === 'removeLabel');
    assert.equal((removeLabel?.args as { name: string }).name, LGTM_LABEL);
  });

  it('grantApprove adds the approved label', async () => {
    const calls: Call[] = [];
    await grantApprove(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const addLabels = calls.find((c) => c.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, [APPROVED_LABEL]);
  });

  it('revokeApprove removes the approved label', async () => {
    const calls: Call[] = [];
    await revokeApprove(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const removeLabel = calls.find((c) => c.method === 'removeLabel');
    assert.equal((removeLabel?.args as { name: string }).name, APPROVED_LABEL);
  });

  it('grantHold adds the do-not-merge/hold label', async () => {
    const calls: Call[] = [];
    await grantHold(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const addLabels = calls.find((c) => c.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, [HOLD_LABEL]);
  });

  it('revokeHold removes the do-not-merge/hold label', async () => {
    const calls: Call[] = [];
    await revokeHold(fakeOctokit(calls), 'kubevirt-ui', 'kubevirt-plugin', 42);
    const removeLabel = calls.find((c) => c.method === 'removeLabel');
    assert.equal((removeLabel?.args as { name: string }).name, HOLD_LABEL);
  });
});
