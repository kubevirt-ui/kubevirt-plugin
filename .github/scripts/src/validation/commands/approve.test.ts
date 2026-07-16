import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { approveAiConfig, approveCiScripts } from './approve';
import type { ApprovalContext } from './approve';
import { CI_SCRIPTS_CONFIG } from '../ci-scripts-validation/constants';

const OWNERS_CONTENT = ['approvers:', '  - alice-approver'].join('\n');

type Call = { method: string; args: unknown };

const fakeOctokit = (ownersContent: string | null, calls: Call[]): Octokit =>
  ({
    repos: {
      getContent: async (args: unknown) => {
        calls.push({ method: 'getContent', args });
        if (ownersContent === null) throw new Error('Not Found');
        return { data: { content: Buffer.from(ownersContent, 'utf8').toString('base64') } };
      },
    },
    issues: {
      getLabel: async (args: unknown) => {
        calls.push({ method: 'getLabel', args });
        return { data: {} };
      },
      addLabels: async (args: unknown) => {
        calls.push({ method: 'addLabels', args });
      },
    },
    reactions: {
      createForIssueComment: async (args: unknown) => {
        calls.push({ method: 'createForIssueComment', args });
      },
    },
  }) as unknown as Octokit;

const baseCtx = (octokit: Octokit, contentsOctokit: Octokit, author: string): ApprovalContext => ({
  octokit,
  contentsOctokit,
  owner: 'kubevirt-ui',
  repo: 'kubevirt-plugin',
  prNumber: 42,
  baseBranch: 'main',
  author,
  commentId: 123,
});

describe('approveAiConfig', () => {
  it('rejects an untrusted author: reacts -1, adds no label, throws', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await assert.rejects(
      () => approveAiConfig(baseCtx(octokit, contentsOctokit, 'random-contributor')),
      /not authorized to use \/ai-approved/,
    );

    assert.equal(botCalls.filter((c) => c.method === 'createForIssueComment').length, 1);
    assert.deepEqual(
      (botCalls.find((c) => c.method === 'createForIssueComment')?.args as { content: string })
        .content,
      '-1',
    );
    assert.equal(
      botCalls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('approves a trusted author: adds the reviewed label, reacts +1', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await approveAiConfig(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    assert.equal(
      botCalls.some((c) => c.method === 'addLabels'),
      true,
    );
    const reaction = botCalls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });

  it('reads OWNERS via contentsOctokit, not octokit', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await approveAiConfig(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    assert.equal(
      contentsCalls.some((c) => c.method === 'getContent'),
      true,
    );
    assert.equal(
      botCalls.some((c) => c.method === 'getContent'),
      false,
    );
  });
});

describe('approveCiScripts', () => {
  it('rejects an untrusted author: reacts -1, adds no label, throws', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await assert.rejects(
      () => approveCiScripts(baseCtx(octokit, contentsOctokit, 'random-contributor')),
      /not authorized to use \/ci-approved/,
    );

    assert.equal(botCalls.filter((c) => c.method === 'createForIssueComment').length, 1);
    assert.deepEqual(
      (botCalls.find((c) => c.method === 'createForIssueComment')?.args as { content: string })
        .content,
      '-1',
    );
    assert.equal(
      botCalls.some((c) => c.method === 'addLabels'),
      false,
    );
  });

  it('approves a trusted author: adds the CI reviewed label, reacts +1', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await approveCiScripts(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const addLabels = botCalls.find((c) => c.method === 'addLabels');
    assert.ok(addLabels);
    assert.deepEqual((addLabels.args as { labels: string[] }).labels, [
      CI_SCRIPTS_CONFIG.labels.reviewed,
    ]);
    const reaction = botCalls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });
});
