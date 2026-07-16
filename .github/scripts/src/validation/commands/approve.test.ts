import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { CI_SCRIPTS_CONFIG } from '../ci-scripts-validation/constants';
import type { ApprovalContext } from './approve';
import { applyApprove, approveAiConfig, approveCiScripts, cancelApprove } from './approve';

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
      removeLabel: async (args: unknown) => {
        calls.push({ method: 'removeLabel', args });
      },
      createComment: async (args: unknown) => {
        calls.push({ method: 'createComment', args });
      },
    },
    reactions: {
      createForIssueComment: async (args: unknown) => {
        calls.push({ method: 'createForIssueComment', args });
      },
    },
  }) as unknown as Octokit;

const baseCtx = (
  octokit: Octokit,
  contentsOctokit: Octokit,
  author: string,
  prAuthor = 'pr-author',
): ApprovalContext => ({
  octokit,
  contentsOctokit,
  owner: 'kubevirt-ui',
  repo: 'kubevirt-plugin',
  prNumber: 42,
  baseBranch: 'main',
  author,
  commentId: 123,
  prAuthor,
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

describe('applyApprove', () => {
  it('rejects the PR author approving their own PR: reacts -1, adds no label, throws', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await assert.rejects(
      () => applyApprove(baseCtx(octokit, contentsOctokit, 'alice-approver', 'alice-approver')),
      /not authorized to use \/approve/,
    );

    assert.equal(
      botCalls.some((c) => c.method === 'addLabels'),
      false,
    );
    assert.equal(
      botCalls.some((c) => c.method === 'createComment'),
      true,
    );
    const reaction = botCalls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '-1');
  });

  it('rejects self-approval when author and prAuthor differ only by case', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await assert.rejects(
      () => applyApprove(baseCtx(octokit, contentsOctokit, 'Alice-Approver', 'alice-approver')),
      /not authorized to use \/approve/,
    );

    assert.equal(
      botCalls.some((c) => c.method === 'addLabels'),
      false,
    );
    assert.equal(
      botCalls.some((c) => c.method === 'createComment'),
      true,
    );
    const reaction = botCalls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '-1');
  });

  it('rejects a non-OWNERS-approver: reacts -1, adds no label, throws', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await assert.rejects(
      () => applyApprove(baseCtx(octokit, contentsOctokit, 'random-contributor')),
      /not authorized to use \/approve/,
    );

    assert.equal(
      botCalls.some((c) => c.method === 'addLabels'),
      false,
    );
    const reaction = botCalls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '-1');
  });

  it('approves a root-OWNERS approver: adds the approved label, reacts +1', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await applyApprove(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const addLabels = botCalls.find((c) => c.method === 'addLabels');
    assert.deepEqual((addLabels?.args as { labels: string[] }).labels, ['approved']);
    const reaction = botCalls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });

  it('reads the root OWNERS file, not .github/OWNERS', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await applyApprove(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const getContentCall = contentsCalls.find((c) => c.method === 'getContent');
    assert.equal((getContentCall?.args as { path: string }).path, 'OWNERS');
  });
});

describe('cancelApprove', () => {
  it('rejects a non-OWNERS-approver: reacts -1, removes no label, throws', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await assert.rejects(
      () => cancelApprove(baseCtx(octokit, contentsOctokit, 'random-contributor')),
      /not authorized to use \/approve cancel/,
    );

    assert.equal(
      botCalls.some((c) => c.method === 'removeLabel'),
      false,
    );
  });

  it('removes the approved label for a root-OWNERS approver', async () => {
    const botCalls: Call[] = [];
    const contentsCalls: Call[] = [];
    const octokit = fakeOctokit(OWNERS_CONTENT, botCalls);
    const contentsOctokit = fakeOctokit(OWNERS_CONTENT, contentsCalls);

    await cancelApprove(baseCtx(octokit, contentsOctokit, 'alice-approver'));

    const removeLabel = botCalls.find((c) => c.method === 'removeLabel');
    assert.equal((removeLabel?.args as { name: string }).name, 'approved');
    const reaction = botCalls.find((c) => c.method === 'createForIssueComment');
    assert.equal((reaction?.args as { content: string }).content, '+1');
  });
});
