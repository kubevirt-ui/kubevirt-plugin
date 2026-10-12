import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { LabelSyncContext } from './label-sync';
import { syncValidationLabels } from './label-sync';
import type { PathValidationConfig } from './types';

const TEST_CONFIG: PathValidationConfig = {
  commandName: '/test-approved',
  displayName: 'Test validation',
  exactPaths: [],
  labelMeta: {
    alert: { color: 'f59e0b', description: 'alert' },
    block: { color: 'b60205', description: 'block' },
  },
  labels: { alert: 'alert', block: 'block', reviewed: 'reviewed', skip: 'skip' },
  pathPrefixes: ['protected/'],
};

type Call = { args: unknown; method: string };

const fakeOctokit = (calls: Call[], tag: string): Octokit =>
  ({
    issues: {
      addLabels: async (args: unknown) => {
        calls.push({ args, method: `addLabels:${tag}` });
      },
      getLabel: async () => ({ data: {} }),
      removeLabel: async (args: unknown) => {
        calls.push({ args, method: `removeLabel:${tag}` });
      },
    },
  }) as unknown as Octokit;

const baseCtx = (octokit: Octokit): LabelSyncContext => ({
  config: { owner: 'kubevirt-ui', repo: 'kubevirt-plugin', token: 'x' },
  octokit,
  prNumber: 1,
});

describe('syncValidationLabels', () => {
  it('removes alert and block when there are no sensitive changes', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await syncValidationLabels(baseCtx(octokit), TEST_CONFIG, true, false);
    const removed = calls
      .filter((call) => call.method === 'removeLabel:main')
      .map((call) => (call.args as { name: string }).name);
    assert.deepEqual(
      [...removed].sort((left: string, right: string) => left.localeCompare(right)),
      [TEST_CONFIG.labels.alert, TEST_CONFIG.labels.block].sort((left: string, right: string) =>
        left.localeCompare(right),
      ),
    );
    assert.equal(
      calls.some((call) => call.method === 'addLabels:main'),
      false,
    );
  });

  it('adds alert and removes block when sensitive changes are reviewed', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await syncValidationLabels(baseCtx(octokit), TEST_CONFIG, true, true);
    const added = calls.find((call) => call.method === 'addLabels:main');
    assert.deepEqual((added?.args as { labels: string[] }).labels, [TEST_CONFIG.labels.alert]);
    assert.equal(
      (calls.find((call) => call.method === 'removeLabel:main')?.args as { name: string }).name,
      TEST_CONFIG.labels.block,
    );
  });

  it('adds both alert and block when sensitive changes are not reviewed', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(calls, 'main');
    await syncValidationLabels(baseCtx(octokit), TEST_CONFIG, false, true);
    const addedLabels = calls
      .filter((call) => call.method === 'addLabels:main')
      .flatMap((call) => (call.args as { labels: string[] }).labels);
    assert.deepEqual(
      [...addedLabels].sort((left: string, right: string) => left.localeCompare(right)),
      [TEST_CONFIG.labels.alert, TEST_CONFIG.labels.block].sort((left: string, right: string) =>
        left.localeCompare(right),
      ),
    );
    assert.equal(
      calls.some((call) => call.method === 'removeLabel:main'),
      false,
    );
  });
});
