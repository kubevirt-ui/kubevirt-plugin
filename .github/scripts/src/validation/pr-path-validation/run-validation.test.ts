import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type { PathValidationContext } from './run-validation';
import { runPathValidation } from './run-validation';
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

type FakeOctokitOptions = {
  files: Array<{ filename: string; patch?: string }>;
  /** Fake "labeled" issue-events, most recent last -- drives isLabelAppliedByTrustedActor's actor lookup for the skip label. */
  labelEvents?: Array<{ actor: string; label: string }>;
  labels: string[];
};

type Call = { args: unknown; method: string };

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
    issues: {
      addLabels: async (args: { labels: string[] }) => {
        calls.push({ args, method: 'addLabels' });
        for (const l of args.labels) labels.add(l);
      },
      createLabel: async () => ({ data: {} }),
      getLabel: async ({ name }: { name: string }) => {
        if (!labels.has(name)) {
          const err = new Error('Not Found') as Error & { status: number };
          err.status = 404;
          throw err;
        }
        return { data: {} };
      },
      listEvents,
      listLabelsOnIssue: async () => ({
        data: [...labels].map((name) => ({ name })),
      }),
      removeLabel: async (args: { name: string }) => {
        calls.push({ args, method: 'removeLabel' });
        labels.delete(args.name);
      },
    },
    // getPullRequestFiles / isLabelAppliedByTrustedActor's only paginate calls.
    paginate: async (method: unknown) => {
      if (method === listFiles) return (await listFiles()).data;
      if (method === listEvents) return (await listEvents()).data;
      return [];
    },
    pulls: {
      listFiles,
    },
    repos: {
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
  baseBranch: 'main',
  config: { owner: 'kubevirt-ui', repo: 'kubevirt-plugin', token: 'x' },
  event,
  octokit,
  prNumber: 1,
  statusOctokit,
});

describe('runPathValidation', () => {
  it('passes with no sensitive changes -- alert/block removed', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      { files: [{ filename: 'src/App.tsx' }], labels: ['alert', 'block'] },
      calls,
    );

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG);

    assert.deepEqual(outcome, { kind: 'passed', sensitivePaths: [] });
    assert.equal(calls.filter((c) => c.method === 'removeLabel').length, 2);
  });

  it('fails with sensitive changes and no reviewed label -- alert+block added', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ files: [{ filename: 'protected/foo.ts' }], labels: [] }, calls);

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG);

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
    assert.equal(calls.filter((c) => c.method === 'addLabels').length, 2);
  });

  it('passes with sensitive changes and the reviewed label present -- block removed', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      { files: [{ filename: 'protected/foo.ts' }], labels: ['reviewed'] },
      calls,
    );

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG);

    assert.deepEqual(outcome, { kind: 'passed', sensitivePaths: ['protected/foo.ts'] });
    assert.equal(
      calls.some(
        (c) => c.method === 'removeLabel' && (c.args as { name: string }).name === 'block',
      ),
      true,
    );
  });

  it('skips when the skip label was applied by the approval bot -- also clears alert/block', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      {
        files: [{ filename: 'protected/foo.ts' }],
        labelEvents: [{ actor: 'kubevirt-plugin-bot[bot]', label: 'skip' }],
        labels: ['skip', 'alert', 'block'],
      },
      calls,
    );

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG);

    assert.deepEqual(outcome, { kind: 'skipped' });
    // Block is cleared; alert stays (already present, and still sensitive).
    assert.equal(
      calls.some(
        (c) => c.method === 'removeLabel' && (c.args as { name: string }).name === 'block',
      ),
      true,
    );
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

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG);

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
  });

  it('does not skip when the skip label\u2019s applying actor can\u2019t be determined (no matching labeled event) -- fails closed', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      { files: [{ filename: 'protected/foo.ts' }], labelEvents: [], labels: ['skip'] },
      calls,
    );

    const outcome = await runPathValidation(buildCtx(octokit), TEST_CONFIG);

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
    );

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
    assert.equal(
      calls.some(
        (c) => c.method === 'removeLabel' && (c.args as { name: string }).name === 'reviewed',
      ),
      true,
    );
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
    );

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
    assert.equal(
      calls.some((c) => c.method === 'removeLabel' && (c.args as { name: string }).name === 'skip'),
      true,
    );
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

    await runPathValidation(buildCtx(botOctokit, {}, statusOctokit), TEST_CONFIG);

    assert.equal(statusGetContent > 0, true);
    assert.equal(botGetContent, 0);
  });

  it('does not clear reviewed on a non-synchronize event (e.g. opened)', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit(
      { files: [{ filename: 'protected/foo.ts' }], labels: ['reviewed'] },
      calls,
    );

    const outcome = await runPathValidation(buildCtx(octokit, { action: 'opened' }), TEST_CONFIG);

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
    );

    assert.deepEqual(outcome, { kind: 'failed', sensitivePaths: ['protected/foo.ts'] });
  });
});
