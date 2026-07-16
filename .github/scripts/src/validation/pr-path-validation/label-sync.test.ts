import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { LabelSyncContext } from './label-sync';
import { publishCheckRun, reportCommitStatus, syncValidationLabels } from './label-sync';
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

let nextCheckRunId = 1000;

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
    checks: {
      create: async (args: unknown) => {
        calls.push({ method: `checks.create:${id}`, args });
        return { data: { id: nextCheckRunId++ } };
      },
      update: async (args: unknown) => {
        calls.push({ method: `checks.update:${id}`, args });
        return { data: { id: (args as { check_run_id: number }).check_run_id } };
      },
    },
  }) as unknown as Octokit;

const baseCtx = (octokit: Octokit, statusOctokit?: Octokit): LabelSyncContext => ({
  octokit,
  statusOctokit,
  config: { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
  prNumber: 1,
  headSha: 'abc123',
  checkRunId: {},
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

  it('also publishes a check-run alongside the plain status, under the same context name', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await reportCommitStatus(baseCtx(octokit), TEST_CONFIG, 'pending', 'in progress');
    const created = calls.find((c) => c.method === 'checks.create:main');
    assert.ok(created);
    assert.equal((created?.args as { name: string }).name, TEST_CONFIG.statusContext);
    assert.equal((created?.args as { status: string }).status, 'in_progress');
  });
});

describe('publishCheckRun', () => {
  it('creates a check-run on the first call, then updates that same check-run on a later call in the same context', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    const ctx = baseCtx(octokit);

    await publishCheckRun(ctx, TEST_CONFIG, 'pending', 'title', 'in progress');
    await publishCheckRun(ctx, TEST_CONFIG, 'success', 'title', 'done');

    const created = calls.find((c) => c.method === 'checks.create:main');
    const updated = calls.find((c) => c.method === 'checks.update:main');
    assert.ok(created);
    assert.ok(updated);
    assert.equal((updated?.args as { check_run_id: number }).check_run_id, ctx.checkRunId?.current);
    assert.equal((updated?.args as { conclusion: string }).conclusion, 'success');
  });

  it('uses statusOctokit for the check-run when provided, not octokit', async () => {
    const mainCalls: Call[] = [];
    const statusCalls: Call[] = [];
    const octokit = fakeOctokit(mainCalls, 'main');
    const statusOctokit = fakeOctokit(statusCalls, 'status');

    await publishCheckRun(baseCtx(octokit, statusOctokit), TEST_CONFIG, 'success', 'title', 'ok');

    assert.equal(
      statusCalls.some((c) => c.method === 'checks.create:status'),
      true,
    );
    assert.equal(
      mainCalls.some((c) => c.method === 'checks.create:main'),
      false,
    );
  });

  it('does not throw when the check-run API is unavailable -- best-effort only', async () => {
    const ctx: LabelSyncContext = {
      config: { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
      headSha: 'abc123',
      octokit: {} as Octokit,
      prNumber: 1,
    };
    await assert.doesNotReject(publishCheckRun(ctx, TEST_CONFIG, 'success', 'title', 'ok'));
  });

  it('is a no-op without a headSha', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await publishCheckRun(
      { ...baseCtx(octokit), headSha: undefined },
      TEST_CONFIG,
      'success',
      't',
      's',
    );
    assert.equal(calls.length, 0);
  });

  it('maps an unexpected error to a completed check-run with a blocking "failure" conclusion, not "neutral"', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await publishCheckRun(baseCtx(octokit), TEST_CONFIG, 'error', 'title', 'unexpected error');
    const created = calls.find((c) => c.method === 'checks.create:main');
    assert.ok(created);
    assert.equal((created?.args as { status: string }).status, 'completed');
    assert.equal((created?.args as { conclusion: string }).conclusion, 'failure');
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
