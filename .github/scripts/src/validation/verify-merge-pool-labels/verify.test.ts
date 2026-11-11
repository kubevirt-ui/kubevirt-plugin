import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import type {
  VerifyHoldRemovalContext,
  VerifyMergePoolLabelContext,
  VerifyMergePoolLabelDeps,
} from './verify';
import {
  getLabelApplyingActor,
  isTrustedMergePoolLabelActor,
  verifyMergePoolHoldRemoval,
  verifyMergePoolLabel,
} from './verify';

type Call = { args: unknown; method: string };

const ROOT_OWNERS = ['approvers:', '  - alice-approver', 'reviewers:', '  - bob-reviewer'].join(
  '\n',
);

const fakeOctokit = (
  opts: {
    contentCalls?: Call[];
    ownersContent?: null | string;
  },
  calls: Call[],
): Octokit =>
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
    repos: {
      getContent: async (args: { path: string; ref?: string }) => {
        assert.equal(args.path, 'OWNERS');
        opts.contentCalls?.push({ args, method: 'getContent' });
        if (opts.ownersContent === null || opts.ownersContent === undefined) {
          throw new Error('Not Found');
        }
        return {
          data: { content: Buffer.from(opts.ownersContent, 'utf8').toString('base64') },
        };
      },
    },
  }) as unknown as Octokit;

const buildCtx = (
  overrides: Partial<VerifyMergePoolLabelContext>,
  calls: Call[],
  octokitOpts: {
    ownersContent?: null | string;
  } = {
    ownersContent: ROOT_OWNERS,
  },
): VerifyMergePoolLabelContext => ({
  config: { owner: 'kubevirt-ui', repo: 'kubevirt-plugin', token: 'x' },
  labelName: 'lgtm',
  octokit: fakeOctokit(octokitOpts, calls),
  prAuthor: 'pr-author',
  prNumber: 1,
  sender: 'bob-reviewer',
  ...overrides,
});

const fakeDeps = (
  presentLabels: string[],
  actors: Record<string, string>,
): VerifyMergePoolLabelDeps => ({
  getLabelApplyingActor: async (_o, _ow, _r, _n, labelName) => actors[labelName],
  getPrLabelNames: async () => new Set(presentLabels),
});

describe('isTrustedMergePoolLabelActor', () => {
  it('trusts the approval bot for every watched label', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({}, calls);
    for (const labelName of ['lgtm', 'approved', 'do-not-merge/hold']) {
      assert.equal(
        await isTrustedMergePoolLabelActor(
          octokit,
          'o',
          'r',
          labelName,
          'kubevirt-plugin-bot[bot]',
          'pr-author',
        ),
        true,
      );
    }
  });

  it('rejects self-applied lgtm and approved, including for OWNERS approvers', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ ownersContent: ROOT_OWNERS }, calls);
    assert.equal(
      await isTrustedMergePoolLabelActor(octokit, 'o', 'r', 'lgtm', 'pr-author', 'pr-author'),
      false,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'approved',
        'alice-approver',
        'alice-approver',
      ),
      false,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'approved',
        'random-user',
        'alice-approver',
      ),
      false,
    );
  });

  it('rejects self-applied lgtm when actor and prAuthor differ only by case', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ ownersContent: ROOT_OWNERS }, calls);
    assert.equal(
      await isTrustedMergePoolLabelActor(octokit, 'o', 'r', 'lgtm', 'PR-Author', 'pr-author'),
      false,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'approved',
        'Alice-Approver',
        'alice-approver',
      ),
      false,
    );
  });

  it('requires root OWNERS membership for lgtm/hold and approver status for approved', async () => {
    const calls: Call[] = [];
    const contentCalls: Call[] = [];
    const octokit = fakeOctokit({ contentCalls, ownersContent: ROOT_OWNERS }, calls);

    assert.equal(
      await isTrustedMergePoolLabelActor(octokit, 'o', 'r', 'lgtm', 'bob-reviewer', 'pr-author'),
      true,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(octokit, 'o', 'r', 'lgtm', 'random-user', 'pr-author'),
      false,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'approved',
        'alice-approver',
        'pr-author',
      ),
      true,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'approved',
        'bob-reviewer',
        'pr-author',
      ),
      false,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'do-not-merge/hold',
        'bob-reviewer',
        'pr-author',
      ),
      true,
    );
    assert.deepEqual(
      contentCalls.map(({ args }) => {
        const { path, ref } = args as { path: string; ref?: string };
        return { path, ref };
      }),
      [
        { path: 'OWNERS', ref: undefined },
        { path: 'OWNERS', ref: undefined },
        { path: 'OWNERS', ref: 'main' },
        { path: 'OWNERS', ref: 'main' },
        { path: 'OWNERS', ref: undefined },
      ],
    );
  });
});

describe('verifyMergePoolLabel', () => {
  it('ignores unrelated labels', async () => {
    const calls: Call[] = [];
    await verifyMergePoolLabel(buildCtx({ labelName: 'unrelated' }, calls), fakeDeps([], {}));
    assert.equal(calls.length, 0);
  });

  it('leaves bot-applied lgtm in place', async () => {
    const calls: Call[] = [];
    await verifyMergePoolLabel(
      buildCtx({ labelName: 'lgtm', sender: 'kubevirt-plugin-bot[bot]' }, calls),
      fakeDeps(['lgtm'], {}),
    );
    assert.equal(calls.length, 0);
  });

  it('strips UI-applied lgtm from someone not listed in root OWNERS', async () => {
    const calls: Call[] = [];
    await verifyMergePoolLabel(
      buildCtx({ labelName: 'lgtm', sender: 'random-user' }, calls, { ownersContent: ROOT_OWNERS }),
      fakeDeps(['lgtm'], {}),
    );
    assert.equal(calls.length, 1);
    assert.equal((calls[0].args as { name: string }).name, 'lgtm');
  });

  it('strips self-applied approved from an OWNERS author', async () => {
    const calls: Call[] = [];
    await verifyMergePoolLabel(
      buildCtx(
        {
          labelName: 'approved',
          prAuthor: 'alice-approver',
          sender: 'alice-approver',
        },
        calls,
        { ownersContent: ROOT_OWNERS },
      ),
      fakeDeps(['approved'], {}),
    );
    assert.equal(calls.filter((c) => c.method === 'removeLabel').length, 1);
  });

  it('leaves trusted hold and strips untrusted lgtm when both are present', async () => {
    const calls: Call[] = [];
    await verifyMergePoolLabel(
      buildCtx({ labelName: 'lgtm', sender: 'random-user' }, calls, {
        ownersContent: ROOT_OWNERS,
      }),
      fakeDeps(['lgtm', 'do-not-merge/hold'], {
        'do-not-merge/hold': 'bob-reviewer',
      }),
    );

    assert.deepEqual(
      calls.map((c) => (c.args as { name: string }).name),
      ['lgtm'],
    );
  });

  it('propagates label-list API failures instead of reconciling partially', async () => {
    const calls: Call[] = [];
    await assert.rejects(
      () =>
        verifyMergePoolLabel(buildCtx({ labelName: 'lgtm' }, calls), {
          getLabelApplyingActor: async () => 'bob',
          getPrLabelNames: async () => {
            throw new Error('list labels failed');
          },
        }),
      /list labels failed/,
    );
    assert.equal(calls.length, 0);
  });

  it('propagates timeline lookup failures during reconciliation', async () => {
    const calls: Call[] = [];
    await assert.rejects(
      () =>
        verifyMergePoolLabel(buildCtx({ labelName: 'lgtm', sender: 'random-user' }, calls), {
          getLabelApplyingActor: async () => {
            throw new Error('timeline failed');
          },
          getPrLabelNames: async () => new Set(['lgtm', 'do-not-merge/hold']),
        }),
      /timeline failed/,
    );
  });
});

describe('getLabelApplyingActor', () => {
  it('returns undefined when the timeline has no matching labeled event', async () => {
    const listEvents = async () => ({
      data: [{ actor: { login: 'bob' }, event: 'labeled', label: { name: 'approved' } }],
    });
    const octokit = {
      issues: { listEvents },
      paginate: async (method: unknown) => {
        if (method === listEvents) return (await listEvents()).data;
        return [];
      },
    } as unknown as Octokit;

    assert.equal(await getLabelApplyingActor(octokit, 'o', 'r', 1, 'lgtm'), undefined);
  });

  it('propagates timeline API failures', async () => {
    const listEvents = async () => {
      throw new Error('API down');
    };
    const octokit = {
      issues: { listEvents },
      paginate: async () => {
        throw new Error('API down');
      },
    } as unknown as Octokit;

    await assert.rejects(() => getLabelApplyingActor(octokit, 'o', 'r', 1, 'lgtm'), /API down/);
  });
});

describe('verifyMergePoolHoldRemoval', () => {
  const holdCtx = (
    sender: string,
    calls: Call[],
    ownersContent: null | string = ROOT_OWNERS,
  ): VerifyHoldRemovalContext => ({
    config: { owner: 'kubevirt-ui', repo: 'kubevirt-plugin', token: 'x' },
    octokit: fakeOctokit({ ownersContent }, calls),
    prNumber: 1,
    sender,
  });

  it('allows bot removals without restoring', async () => {
    const calls: Call[] = [];
    await verifyMergePoolHoldRemoval(holdCtx('kubevirt-plugin-bot[bot]', calls, null));
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('allows root OWNERS reviewer removals without restoring', async () => {
    const calls: Call[] = [];
    await verifyMergePoolHoldRemoval(holdCtx('bob-reviewer', calls));
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('restores the label when a non-OWNERS user removes it', async () => {
    const calls: Call[] = [];
    await verifyMergePoolHoldRemoval(holdCtx('random-user', calls));
    const addLabels = calls.find((c) => c.method === 'addLabels');
    assert.ok(addLabels);
    assert.deepEqual((addLabels.args as { labels: string[] }).labels, ['do-not-merge/hold']);
  });
});
