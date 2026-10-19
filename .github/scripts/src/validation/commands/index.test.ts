import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Octokit } from '@octokit/rest';
import {
  COMMAND_FAILURE_SUMMARY_MARKER,
  VALIDATION_COMMENT_MARKER,
} from '../../types/index';
import { handleCommandOutcomes } from './index';
import { HandledValidationError } from '../pr-path-validation/errors';

// Unit tests for handleCommandOutcomes -- the outcome-reconciliation logic extracted
// from main(). Each test drives the real function against a mock Octokit and asserts on
// the GitHub calls it makes (clearing / posting the shared failure summary) and what it throws.

type Comment = { body: string; html_url: string; id: number; user: { type: string } };

describe('handleCommandOutcomes', () => {
  // Mock Octokit that records calls and serves a fixed set of existing comments via paginate.
  const createMockOctokit = (
    existingComments: Comment[],
    opts: { deleteThrows?: boolean } = {},
  ): { octokit: Octokit; calls: { args: unknown; method: string }[] } => {
    const calls: { args: unknown; method: string }[] = [];
    const octokit = {
      issues: {
        createComment: async (args: unknown) => {
          calls.push({ args, method: 'createComment' });
        },
        deleteComment: async (args: unknown) => {
          calls.push({ args, method: 'deleteComment' });
          if (opts.deleteThrows) {
            throw new Error('HTTP 500: API error');
          }
        },
        listComments: () => undefined,
        updateComment: async (args: unknown) => {
          calls.push({ args, method: 'updateComment' });
        },
      },
      paginate: async () => existingComments,
    } as unknown as Octokit;
    return { calls, octokit };
  };

  it('clears a stale failure summary when every command succeeds', async () => {
    const summary: Comment = {
      body: `${COMMAND_FAILURE_SUMMARY_MARKER}\n1 command(s) failed`,
      html_url: 'https://example/summary',
      id: 42,
      user: { type: 'Bot' },
    };
    const { calls, octokit } = createMockOctokit([summary]);

    await handleCommandOutcomes(octokit, 'o', 'r', 1, [{ command: 'lgtm' }]);

    const deletes = calls.filter((c) => c.method === 'deleteComment');
    assert.strictEqual(deletes.length, 1, 'stale summary should be deleted');
    assert.deepStrictEqual((deletes[0].args as { comment_id: number }).comment_id, 42);
  });

  it('does not re-throw when summary cleanup fails on a successful batch', async () => {
    const summary: Comment = {
      body: COMMAND_FAILURE_SUMMARY_MARKER,
      html_url: 'https://example/summary',
      id: 7,
      user: { type: 'Bot' },
    };
    const { octokit } = createMockOctokit([summary], { deleteThrows: true });

    // Must resolve despite the delete throwing -- successful commands aren't failed by cleanup.
    await assert.doesNotReject(
      handleCommandOutcomes(octokit, 'o', 'r', 1, [{ command: 'lgtm' }]),
    );
  });

  it('posts the failure summary and throws HandledValidationError when all failures are handled', async () => {
    const table: Comment = {
      body: `${VALIDATION_COMMENT_MARKER}\nvalidation table`,
      html_url: 'https://example/table',
      id: 100,
      user: { type: 'Bot' },
    };
    const { calls, octokit } = createMockOctokit([table]);

    await assert.rejects(
      handleCommandOutcomes(octokit, 'o', 'r', 1, [
        { command: 'recheck-jira', error: new HandledValidationError('Jira check failed') },
      ]),
      (err: unknown) => err instanceof HandledValidationError,
    );

    // No existing summary comment -> upsert creates one referencing the validation table.
    const creates = calls.filter((c) => c.method === 'createComment');
    assert.strictEqual(creates.length, 1, 'a summary comment should be posted');
    const body = (creates[0].args as { body: string }).body;
    assert.match(body, /1 command\(s\) failed/);
    assert.match(body, /https:\/\/example\/table/);
  });

  it('throws a generic Error (no summary posted) when a failure is unhandled', async () => {
    const { calls, octokit } = createMockOctokit([]);

    await assert.rejects(
      handleCommandOutcomes(octokit, 'o', 'r', 1, [
        { command: 'recheck-jira', error: new HandledValidationError('handled') },
        { command: 'approve', error: new Error('Network error') },
      ]),
      (err: unknown) => err instanceof Error && !(err instanceof HandledValidationError),
    );

    const posts = calls.filter(
      (c) => c.method === 'createComment' || c.method === 'updateComment',
    );
    assert.strictEqual(posts.length, 0, 'no summary comment on unhandled failure');
  });
});
