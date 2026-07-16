import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { LabelSyncContext } from './label-sync';
import { reportCommitStatus, syncValidationLabels } from './label-sync';
import type { PathValidationConfig } from './types';

const TEST_CONFIG: PathValidationConfig = {
  exactPaths: [],
  pathPrefixes: ['protected/'],
  labels: { alert: 'alert', block: 'block', reviewed: 'reviewed', skip: 'skip' },
  labelMeta: {
    alert: { color: 'f59e0b', description: 'alert' },
    block: { color: 'b60205', description: 'block' },
  },
  statusContext: 'test-validation',
  displayName: 'Test validation',
  commandName: '/test-approved',
};

type Call = { method: string; args: unknown };

const fakeOctokit = (calls: Call[], id: string): Octokit =>
  ({
    repos: {
      createCommitStatus: async (args: unknown) => {
        calls.push({ method: `createCommitStatus:${id}`, args });
      },
    },
    issues: {
      getLabel: async () => ({ data: {} }),
      addLabels: async (args: unknown) => {
        calls.push({ method: `addLabels:${id}`, args });
      },
      removeLabel: async (args: unknown) => {
        calls.push({ method: `removeLabel:${id}`, args });
      },
    },
  }) as unknown as Octokit;

const baseCtx = (octokit: Octokit, statusOctokit?: Octokit): LabelSyncContext => ({
  octokit,
  statusOctokit,
  config: { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
  prNumber: 1,
  headSha: 'abc123',
});

describe('reportCommitStatus', () => {
  it('uses octokit when statusOctokit is not provided', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await reportCommitStatus(baseCtx(octokit), TEST_CONFIG, 'success', 'ok');
    assert.equal(
      calls.some((c) => c.method === 'createCommitStatus:main'),
      true,
    );
    assert.equal(
      (calls.find((c) => c.method === 'createCommitStatus:main')?.args as { context: string })
        .context,
      TEST_CONFIG.statusContext,
    );
  });

  it('uses statusOctokit when provided, not octokit -- the mechanism a bot-token failure relies on', async () => {
    const mainCalls: Call[] = [];
    const statusCalls: Call[] = [];
    const octokit = fakeOctokit(mainCalls, 'main');
    const statusOctokit = fakeOctokit(statusCalls, 'status');

    await reportCommitStatus(
      baseCtx(octokit, statusOctokit),
      TEST_CONFIG,
      'error',
      'unexpected error',
    );

    assert.equal(
      statusCalls.some((c) => c.method === 'createCommitStatus:status'),
      true,
    );
    assert.equal(
      (
        statusCalls.find((c) => c.method === 'createCommitStatus:status')?.args as {
          context: string;
        }
      ).context,
      TEST_CONFIG.statusContext,
    );
    assert.equal(
      mainCalls.some((c) => c.method === 'createCommitStatus:main'),
      false,
    );
  });

  it('is a no-op without a headSha', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    const ctx = { ...baseCtx(octokit), headSha: undefined };
    await reportCommitStatus(ctx, TEST_CONFIG, 'success', 'ok');
    assert.equal(calls.length, 0);
  });

  it('publishes only a commit status, not a check-run -- an API-created check-run isn\'t attached to the calling workflow run and gets parked under an unrelated check suite in the merge box', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await reportCommitStatus(baseCtx(octokit), TEST_CONFIG, 'pending', 'in progress');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'createCommitStatus:main');
  });
});

describe('syncValidationLabels', () => {
  it('removes alert and block when there are no sensitive changes', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await syncValidationLabels(baseCtx(octokit), TEST_CONFIG, true, false);
    const removed = calls
      .filter((c) => c.method === 'removeLabel:main')
      .map((c) => (c.args as { name: string }).name);
    assert.deepEqual(removed.sort(), [TEST_CONFIG.labels.alert, TEST_CONFIG.labels.block].sort());
    assert.equal(
      calls.some((c) => c.method === 'addLabels:main'),
      false,
    );
  });

  it('adds alert and removes block when sensitive changes are reviewed', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await syncValidationLabels(baseCtx(octokit), TEST_CONFIG, true, true);
    const added = calls.find((c) => c.method === 'addLabels:main');
    assert.deepEqual((added?.args as { labels: string[] }).labels, [TEST_CONFIG.labels.alert]);
    assert.equal(
      (calls.find((c) => c.method === 'removeLabel:main')?.args as { name: string }).name,
      TEST_CONFIG.labels.block,
    );
  });

  it('adds both alert and block when sensitive changes are not reviewed', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await syncValidationLabels(baseCtx(octokit), TEST_CONFIG, false, true);
    const addedLabels = calls
      .filter((c) => c.method === 'addLabels:main')
      .flatMap((c) => (c.args as { labels: string[] }).labels);
    assert.deepEqual(
      addedLabels.sort(),
      [TEST_CONFIG.labels.alert, TEST_CONFIG.labels.block].sort(),
    );
    assert.equal(
      calls.some((c) => c.method === 'removeLabel:main'),
      false,
    );
  });
});
