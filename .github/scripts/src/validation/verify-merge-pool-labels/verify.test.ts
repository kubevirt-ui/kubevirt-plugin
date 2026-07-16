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

type Call = { method: string; args: unknown };

const ROOT_OWNERS = ['approvers:', '  - alice-approver'].join('\n');

const fakeOctokit = (
  opts: {
    ownersContent?: string | null;
    /** Default permission, or per-username map. */
    permission?: string | null | Record<string, string | null>;
  },
  calls: Call[],
): Octokit =>
  ({
    repos: {
      getContent: async () => {
        if (opts.ownersContent === null || opts.ownersContent === undefined) {
          throw new Error('Not Found');
        }
        return {
          data: { content: Buffer.from(opts.ownersContent, 'utf8').toString('base64') },
        };
      },
      getCollaboratorPermissionLevel: async (args: { username: string }) => {
        const permission =
          typeof opts.permission === 'object' && opts.permission !== null
            ? opts.permission[args.username]
            : opts.permission;
        if (permission === null || permission === undefined) {
          throw new Error('Not Found');
        }
        return { data: { permission } };
      },
    },
    issues: {
      removeLabel: async (args: unknown) => {
        calls.push({ method: 'removeLabel', args });
      },
      getLabel: async (args: unknown) => {
        calls.push({ method: 'getLabel', args });
        return { data: {} };
      },
      addLabels: async (args: unknown) => {
        calls.push({ method: 'addLabels', args });
      },
    },
  }) as unknown as Octokit;

const buildCtx = (
  overrides: Partial<VerifyMergePoolLabelContext>,
  calls: Call[],
  octokitOpts: {
    ownersContent?: string | null;
    permission?: string | null | Record<string, string | null>;
  } = {
    ownersContent: ROOT_OWNERS,
    permission: 'write',
  },
): VerifyMergePoolLabelContext => ({
  octokit: fakeOctokit(octokitOpts, calls),
  config: { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
  labelName: 'lgtm',
  sender: 'bob-collaborator',
  baseBranch: 'main',
  prNumber: 1,
  prAuthor: 'pr-author',
  ...overrides,
});

const fakeDeps = (
  presentLabels: string[],
  actors: Record<string, string>,
): VerifyMergePoolLabelDeps => ({
  getPrLabelNames: async () => new Set(presentLabels),
  getLabelApplyingActor: async (_o, _ow, _r, _n, labelName) => actors[labelName],
});

describe('isTrustedMergePoolLabelActor', () => {
  it('trusts the approval bot for every watched label', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ permission: 'read' }, calls);
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'main',
        'lgtm',
        'kubevirt-plugin-bot[bot]',
        'pr-author',
      ),
      true,
    );
  });

  it('rejects self-applied lgtm/approved even for write/OWNERS actors', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ ownersContent: ROOT_OWNERS, permission: 'admin' }, calls);
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'main',
        'lgtm',
        'pr-author',
        'pr-author',
      ),
      false,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'main',
        'approved',
        'alice-approver',
        'alice-approver',
      ),
      false,
    );
  });

  it('rejects self-applied labels when actor and prAuthor differ only by case', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit({ ownersContent: ROOT_OWNERS, permission: 'admin' }, calls);
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'main',
        'lgtm',
        'PR-Author',
        'pr-author',
      ),
      false,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        octokit,
        'o',
        'r',
        'main',
        'approved',
        'Alice-Approver',
        'alice-approver',
      ),
      false,
    );
  });

  it('requires write access for lgtm/hold and root OWNERS for approved', async () => {
    const calls: Call[] = [];
    const writeOctokit = fakeOctokit({ ownersContent: ROOT_OWNERS, permission: 'write' }, calls);
    const readOctokit = fakeOctokit({ ownersContent: ROOT_OWNERS, permission: 'read' }, calls);

    assert.equal(
      await isTrustedMergePoolLabelActor(
        writeOctokit,
        'o',
        'r',
        'main',
        'lgtm',
        'bob',
        'pr-author',
      ),
      true,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(readOctokit, 'o', 'r', 'main', 'lgtm', 'bob', 'pr-author'),
      false,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        writeOctokit,
        'o',
        'r',
        'main',
        'approved',
        'alice-approver',
        'pr-author',
      ),
      true,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        writeOctokit,
        'o',
        'r',
        'main',
        'approved',
        'bob',
        'pr-author',
      ),
      false,
    );
    assert.equal(
      await isTrustedMergePoolLabelActor(
        writeOctokit,
        'o',
        'r',
        'main',
        'do-not-merge/hold',
        'bob',
        'pr-author',
      ),
      true,
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

  it('strips UI-applied lgtm from a non-collaborator', async () => {
    const calls: Call[] = [];
    await verifyMergePoolLabel(
      buildCtx({ labelName: 'lgtm', sender: 'random-user' }, calls, { permission: 'read' }),
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
          sender: 'alice-approver',
          prAuthor: 'alice-approver',
        },
        calls,
        { ownersContent: ROOT_OWNERS, permission: 'admin' },
      ),
      fakeDeps(['approved'], {}),
    );
    assert.equal(calls.length, 1);
    assert.equal((calls[0].args as { name: string }).name, 'approved');
  });

  it('leaves trusted hold and strips untrusted lgtm when both are present', async () => {
    const calls: Call[] = [];
    await verifyMergePoolLabel(
      buildCtx({ labelName: 'lgtm', sender: 'random-user' }, calls, {
        ownersContent: ROOT_OWNERS,
        permission: {
          'random-user': 'read',
          'bob-collaborator': 'write',
        },
      }),
      fakeDeps(['lgtm', 'do-not-merge/hold'], {
        'do-not-merge/hold': 'bob-collaborator',
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
          getPrLabelNames: async () => {
            throw new Error('list labels failed');
          },
          getLabelApplyingActor: async () => 'bob',
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
          getPrLabelNames: async () => new Set(['lgtm', 'do-not-merge/hold']),
          getLabelApplyingActor: async () => {
            throw new Error('timeline failed');
          },
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
      paginate: async (method: unknown) => {
        if (method === listEvents) return (await listEvents()).data;
        return [];
      },
      issues: { listEvents },
    } as unknown as Octokit;

    assert.equal(await getLabelApplyingActor(octokit, 'o', 'r', 1, 'lgtm'), undefined);
  });

  it('propagates timeline API failures', async () => {
    const listEvents = async () => {
      throw new Error('API down');
    };
    const octokit = {
      paginate: async () => {
        throw new Error('API down');
      },
      issues: { listEvents },
    } as unknown as Octokit;

    await assert.rejects(() => getLabelApplyingActor(octokit, 'o', 'r', 1, 'lgtm'), /API down/);
  });
});

describe('verifyMergePoolHoldRemoval', () => {
  const holdCtx = (
    sender: string,
    calls: Call[],
    permission: string | null | Record<string, string | null> = 'write',
  ): VerifyHoldRemovalContext => ({
    octokit: fakeOctokit({ permission }, calls),
    config: { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
    sender,
    prNumber: 1,
  });

  it('allows bot removals without restoring', async () => {
    const calls: Call[] = [];
    await verifyMergePoolHoldRemoval(holdCtx('kubevirt-plugin-bot[bot]', calls, 'read'));
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('allows write-collaborator removals without restoring', async () => {
    const calls: Call[] = [];
    await verifyMergePoolHoldRemoval(holdCtx('bob-collaborator', calls, 'write'));
    assert.equal(
      calls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('restores the label when a non-collaborator removes it', async () => {
    const calls: Call[] = [];
    await verifyMergePoolHoldRemoval(holdCtx('random-user', calls, 'read'));
    const addLabels = calls.find((c) => c.method === 'addLabels');
    assert.ok(addLabels);
    assert.deepEqual((addLabels.args as { labels: string[] }).labels, ['do-not-merge/hold']);
  });
});
