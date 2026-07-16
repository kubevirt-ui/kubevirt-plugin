import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { PathValidationContext } from './run-validation';
import { runPathValidation } from './run-validation';
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

const buildStatusDescription = (passed: boolean, hasSensitiveChanges: boolean): string =>
  `passed=${passed} sensitive=${hasSensitiveChanges}`;

type FakeOctokitOptions = {
  files: Array<{ filename: string; patch?: string }>;
  labels: string[];
  /** Fake "labeled" issue-events, most recent last -- drives isLabelAppliedByTrustedActor's actor lookup for the skip label. */
  labelEvents?: Array<{ label: string; actor: string }>;
};

type Call = { method: string; args: unknown };

const fakeOctokit = (options: FakeOctokitOptions, calls: Call[]): Octokit => {
  const labels = new Set(options.labels);
  const listFiles = async () => ({ data: options.files });
  const listEvents = async () => ({
    data: (options.labelEvents ?? []).map((e) => ({
      actor: { login: e.actor },
      event: 'labeled',
      label: { name: e.label },
    })),
  });

  return {
    // getPullRequestFiles / isLabelAppliedByTrustedActor's only paginate calls.
    paginate: async (method: unknown) => {
      if (method === listFiles) return (await listFiles()).data;
      if (method === listEvents) return (await listEvents()).data;
      return [];
    },
    pulls: {
      listFiles,
    },
    issues: {
      listEvents,
      listLabelsOnIssue: async () => ({
        data: [...labels].map((name) => ({ name })),
      }),
      getLabel: async ({ name }: { name: string }) => {
        if (!labels.has(name)) {
          const err = new Error('Not Found') as Error & { status: number };
          err.status = 404;
          throw err;
        }
        return { data: {} };
      },
      createLabel: async () => ({ data: {} }),
      addLabels: async (args: { labels: string[] }) => {
        calls.push({ method: 'addLabels', args });
        args.labels.forEach((l) => labels.add(l));
      },
      removeLabel: async (args: { name: string }) => {
        calls.push({ method: 'removeLabel', args });
        labels.delete(args.name);
      },
    },
    repos: {
      createCommitStatus: async (args: { state: string; description: string }) => {
        calls.push({ method: 'createCommitStatus', args });
      },
      // No OWNERS file mocked -- isListedInOwners fails closed (false) for
      // any non-bot actor, which is what the tests below rely on.
      getContent: async () => {
        throw new Error('Not Found');
      },
    },
  } as unknown as Octokit;
};

const buildCtx = (
  octokit: Octokit,
  event: { action?: string } = {},
  statusOctokit?: Octokit,
): PathValidationContext => ({
  octokit,
  statusOctokit,
  baseBranch: 'main',
  config: { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
  prNumber: 1,
  headSha: 'abc123',
  event,
});

const statusesOf = (calls: Call[]): Array<{ state: string; description: string }> =>
  calls
    .filter((c) => c.method === 'createCommitStatus')
    .map((c) => c.args as { state: string; description: string });

describe('runPathValidation', () => {
  it('passes with no sensitive changes -- alert/block removed, success status', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      { files: [{ filename: 'src/App.tsx' }], labels: ['alert', 'block'] },
      calls,
    );

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG, buildStatusDescription);

    assert.deepEqual(outcome, { kind: 'passed', sensitivePaths: [] });
    assert.equal(calls.filter((c) => c.method === 'removeLabel').length, 2);
    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'success');
  });

  it('fails with sensitive changes and no reviewed label -- alert+block added, failure status', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ files: [{ filename: 'protected/foo.ts' }], labels: [] }, calls);

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG, buildStatusDescription);

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
    assert.equal(calls.filter((c) => c.method === 'addLabels').length, 2);
    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'failure');
  });

  it('passes with sensitive changes and the reviewed label present -- block removed, success status', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      { files: [{ filename: 'protected/foo.ts' }], labels: ['reviewed'] },
      calls,
    );

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG, buildStatusDescription);

    assert.deepEqual(outcome, { kind: 'passed', sensitivePaths: ['protected/foo.ts'] });
    assert.equal(
      calls.some(
        (c) => c.method === 'removeLabel' && (c.args as { name: string }).name === 'block',
      ),
      true,
    );
    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'success');
  });

  it('skips when the skip label was applied by the approval bot -- also clears alert/block, success status', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      {
        files: [{ filename: 'protected/foo.ts' }],
        labelEvents: [{ actor: 'kubevirt-plugin-bot[bot]', label: 'skip' }],
        labels: ['skip', 'alert', 'block'],
      },
      calls,
    );

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG, buildStatusDescription);

    assert.deepEqual(outcome, { kind: 'skipped' });
    // Block is cleared; alert stays (already present, and still sensitive).
    assert.equal(
      calls.some(
        (c) => c.method === 'removeLabel' && (c.args as { name: string }).name === 'block',
      ),
      true,
    );
    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'success');
  });

  it('does not skip when the skip label was applied by an untrusted actor -- recomputes as failed instead', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      {
        files: [{ filename: 'protected/foo.ts' }],
        labelEvents: [{ actor: 'random-user', label: 'skip' }],
        labels: ['skip'],
      },
      calls,
    );

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG, buildStatusDescription);

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'failure');
  });

  it('does not skip when the skip label\u2019s applying actor can\u2019t be determined (no matching labeled event) -- fails closed', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      { files: [{ filename: 'protected/foo.ts' }], labelEvents: [], labels: ['skip'] },
      calls,
    );

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG, buildStatusDescription);

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
  });

  it('clears a stale reviewed label on synchronize and recomputes as failed', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      { files: [{ filename: 'protected/foo.ts' }], labels: ['reviewed'] },
      calls,
    );

    const outcome = await runPathValidation(
      buildCtx(octokit, { action: 'synchronize' }),
      TEST_CONFIG,
      buildStatusDescription,
    );

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
    assert.equal(
      calls.some(
        (c) => c.method === 'removeLabel' && (c.args as { name: string }).name === 'reviewed',
      ),
      true,
    );
    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'failure');
  });

  it('clears a maintainer skip on synchronize with new sensitive changes -- bypass cannot be reused', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      {
        files: [{ filename: 'protected/foo.ts' }],
        labelEvents: [{ actor: 'kubevirt-plugin-bot[bot]', label: 'skip' }],
        labels: ['skip', 'alert', 'block'],
      },
      calls,
    );

    const outcome = await runPathValidation(
      buildCtx(octokit, { action: 'synchronize' }),
      TEST_CONFIG,
      buildStatusDescription,
    );

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
    assert.equal(
      calls.some((c) => c.method === 'removeLabel' && (c.args as { name: string }).name === 'skip'),
      true,
    );
    const statuses = statusesOf(calls);
    assert.equal(statuses.at(-1)?.state, 'failure');
  });

  it('reads OWNERS via statusOctokit when provided, not the bot octokit', async () => {
    const botCalls: Call[] = [];
    const statusCalls: Call[] = [];
    const botOctokit = fakeOctokit(
      {
        files: [{ filename: 'protected/foo.ts' }],
        labelEvents: [{ actor: 'alice-approver', label: 'skip' }],
        labels: ['skip'],
      },
      botCalls,
    );
    const statusOctokit = fakeOctokit(
      {
        files: [{ filename: 'protected/foo.ts' }],
        labelEvents: [{ actor: 'alice-approver', label: 'skip' }],
        labels: ['skip'],
      },
      statusCalls,
    );
    // Track getContent on each client.
    let botGetContent = 0;
    let statusGetContent = 0;
    (botOctokit.repos as unknown as { getContent: () => Promise<never> }).getContent = async () => {
      botGetContent += 1;
      throw new Error('Not Found');
    };
    (statusOctokit.repos as unknown as { getContent: () => Promise<never> }).getContent =
      async () => {
        statusGetContent += 1;
        throw new Error('Not Found');
      };

    await runPathValidation(
      buildCtx(botOctokit, {}, statusOctokit),
      TEST_CONFIG,
      buildStatusDescription,
    );

    assert.equal(statusGetContent > 0, true);
    assert.equal(botGetContent, 0);
  });

  it('does not clear reviewed on a non-synchronize event (e.g. opened)', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      { files: [{ filename: 'protected/foo.ts' }], labels: ['reviewed'] },
      calls,
    );

    const outcome = await runPathValidation(
      buildCtx(octokit, { action: 'opened' }),
      TEST_CONFIG,
      buildStatusDescription,
    );

    assert.deepEqual(outcome, { kind: 'passed', sensitivePaths: ['protected/foo.ts'] });
    assert.equal(
      calls.some(
        (c) => c.method === 'removeLabel' && (c.args as { name: string }).name === 'reviewed',
      ),
      false,
    );
  });

  it('uses pre-fetched files and never calls getPullRequestFiles when ctx.files is provided', async () => {
    const calls: Call[] = [];
    // options.files would make this pass as non-sensitive if fetched --
    // proves the pre-fetched list, not this one, drives the outcome.
    const octokit = fakeOctokit({ files: [{ filename: 'src/App.tsx' }], labels: [] }, calls);
    (octokit as unknown as { pulls: unknown }).pulls = {
      listFiles: () => {
        throw new Error('getPullRequestFiles should not be called when ctx.files is set');
      },
    };
    (octokit as unknown as { paginate: unknown }).paginate = () => {
      throw new Error('getPullRequestFiles should not be called when ctx.files is set');
    };

    const outcome = await runPathValidation(
      { ...buildCtx(octokit), files: [{ filename: 'protected/foo.ts' }] },
      TEST_CONFIG,
      buildStatusDescription,
    );

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
  });

  it('reports an initial pending status before resolving', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ files: [{ filename: 'src/App.tsx' }], labels: [] }, calls);

    await runPathValidation(buildCtx(octokit), TEST_CONFIG, buildStatusDescription);

    const statuses = statusesOf(calls);
    assert.equal(statuses[0]?.state, 'pending');
  });

});
