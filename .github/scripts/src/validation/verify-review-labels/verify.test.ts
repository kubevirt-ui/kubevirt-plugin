import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { HandledValidationError } from '../pr-path-validation/errors';
import type { VerifyReviewLabelContext, VerifyReviewLabelDeps } from './verify';
import { verifyReviewLabel } from './verify';

type Call = { method: string; args: unknown };

const fakeOctokit = (
  ownersContent: string | null,
  calls: Call[],
  labelEvents: Array<{ label: string; actor: string }> = [],
): Octokit => {
  const listEvents = async () => ({
    data: labelEvents.map((e) => ({
      actor: { login: e.actor },
      event: 'labeled',
      label: { name: e.label },
    })),
  });
  return {
    paginate: async (method: unknown) => {
      if (method === listEvents) return (await listEvents()).data;
      return [];
    },
    repos: {
      getContent: async () => {
        if (ownersContent === null) throw new Error('Not Found');
        return { data: { content: Buffer.from(ownersContent, 'utf8').toString('base64') } };
      },
    },
    issues: {
      listEvents,
      removeLabel: async (args: { name: string }) => {
        calls.push({ method: 'removeLabel', args });
      },
    },
  } as unknown as Octokit;
};

const OWNERS_CONTENT = ['approvers:', '  - alice-approver'].join('\n');

const buildCtx = (
  overrides: Partial<VerifyReviewLabelContext>,
  calls: Call[],
  labelEvents?: Array<{ label: string; actor: string }>,
): VerifyReviewLabelContext => ({
  octokit: fakeOctokit(OWNERS_CONTENT, calls, labelEvents),
  config: { token: 'x', owner: 'kubevirt-ui', repo: 'kubevirt-plugin' },
  labelName: 'ai-config-reviewed',
  sender: 'alice-approver',
  baseBranch: 'main',
  prNumber: 1,
  headSha: 'abc123',
  ...overrides,
});

const fakeDeps = (
  dispatched: string[],
  presentLabels: string[],
  throwOn?: 'handled' | 'unhandled',
): VerifyReviewLabelDeps => ({
  executeAiConfigValidation: async () => {
    dispatched.push('ai');
    if (throwOn === 'handled') throw new HandledValidationError('handled');
    if (throwOn === 'unhandled') throw new Error('boom');
  },
  executeCiScriptsValidation: async () => {
    dispatched.push('ci');
    if (throwOn === 'handled') throw new HandledValidationError('handled');
    if (throwOn === 'unhandled') throw new Error('boom');
  },
  getPrLabelNames: async () => new Set(presentLabels),
});

describe('verifyReviewLabel', () => {
  it('ignores labels unrelated to AI/CI review', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    await verifyReviewLabel(
      buildCtx({ labelName: 'unrelated-label' }, calls),
      fakeDeps(dispatched, []),
    );

    assert.equal(calls.length, 0);
    assert.equal(dispatched.length, 0);
  });

  it('exempts bot senders without checking OWNERS', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    await verifyReviewLabel(
      buildCtx({ sender: 'kubevirt-plugin-bot[bot]' }, calls),
      fakeDeps(dispatched, ['ai-config-reviewed']),
    );

    assert.equal(calls.length, 0);
    assert.equal(dispatched.length, 0);
  });

  it('does not exempt an unrelated bot/app -- only the exact approval bot login is trusted', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    await verifyReviewLabel(
      buildCtx({ sender: 'some-other-app[bot]' }, calls),
      fakeDeps(dispatched, ['ai-config-reviewed']),
    );

    assert.equal(calls.length, 1);
    assert.deepEqual(dispatched, ['ai']);
  });

  it('does not exempt an unrelated bot/app on a skip-* label either', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    await verifyReviewLabel(
      buildCtx({ labelName: 'skip-ai-config-check', sender: 'some-other-app[bot]' }, calls),
      fakeDeps(dispatched, ['skip-ai-config-check']),
    );

    assert.equal(calls.length, 1);
    assert.equal((calls[0].args as { name: string }).name, 'skip-ai-config-check');
    assert.deepEqual(dispatched, ['ai']);
  });

  it('leaves the label in place for an OWNERS-listed sender', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    await verifyReviewLabel(
      buildCtx({ sender: 'alice-approver' }, calls),
      fakeDeps(dispatched, ['ai-config-reviewed']),
    );

    assert.equal(calls.length, 0);
    assert.equal(dispatched.length, 0);
  });

  it('strips the label and dispatches AI validation for an unauthorized sender on an AI label', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    await verifyReviewLabel(
      buildCtx({ labelName: 'ai-config-reviewed', sender: 'random-user' }, calls),
      fakeDeps(dispatched, ['ai-config-reviewed']),
    );

    assert.equal(calls.length, 1);
    assert.equal((calls[0].args as { name: string }).name, 'ai-config-reviewed');
    assert.deepEqual(dispatched, ['ai']);
  });

  it('strips the label and dispatches CI validation for an unauthorized sender on a CI label', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    await verifyReviewLabel(
      buildCtx({ labelName: 'ci-scripts-reviewed', sender: 'random-user' }, calls),
      fakeDeps(dispatched, ['ci-scripts-reviewed']),
    );

    assert.equal(calls.length, 1);
    assert.equal((calls[0].args as { name: string }).name, 'ci-scripts-reviewed');
    assert.deepEqual(dispatched, ['ci']);
  });

  it('reconciles other watched labels on the PR when an unauthorized label is added during verification', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    // Authorized AI reviewed already present; untrusted CI skip is the trigger.
    await verifyReviewLabel(
      buildCtx({ labelName: 'skip-ci-scripts-check', sender: 'random-user' }, calls, [
        { actor: 'alice-approver', label: 'ai-config-reviewed' },
        { actor: 'random-user', label: 'skip-ci-scripts-check' },
      ]),
      fakeDeps(dispatched, ['ai-config-reviewed', 'skip-ci-scripts-check']),
    );

    assert.equal(
      calls.some((c) => (c.args as { name: string }).name === 'skip-ci-scripts-check'),
      true,
    );
    assert.equal(
      calls.some((c) => (c.args as { name: string }).name === 'ai-config-reviewed'),
      false,
    );
    assert.deepEqual(dispatched, ['ci']);
  });

  it('swallows HandledValidationError from the re-run validation', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    await assert.doesNotReject(
      verifyReviewLabel(
        buildCtx({ sender: 'random-user' }, calls),
        fakeDeps(dispatched, ['ai-config-reviewed'], 'handled'),
      ),
    );
  });

  it('rethrows an unhandled error from the re-run validation', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    await assert.rejects(
      verifyReviewLabel(
        buildCtx({ sender: 'random-user' }, calls),
        fakeDeps(dispatched, ['ai-config-reviewed'], 'unhandled'),
      ),
      /boom/,
    );
  });

  it('fails closed (strips the label) when OWNERS cannot be read', async () => {
    const calls: Call[] = [];
    const dispatched: string[] = [];
    await verifyReviewLabel(
      buildCtx({ octokit: fakeOctokit(null, calls), sender: 'alice-approver' }, calls),
      fakeDeps(dispatched, ['ai-config-reviewed']),
    );

    assert.equal(calls.length, 1);
  });
});
