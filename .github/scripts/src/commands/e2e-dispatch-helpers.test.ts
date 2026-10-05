import assert from 'node:assert/strict';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { findRunningE2ERun, liftE2EHold } from './e2e-dispatch-helpers';

type Call = { args: unknown; method: string };
type WorkflowRun = {
  display_title?: string;
  event: string;
  head_sha?: string;
  id: number;
  pull_requests?: Array<{ number: number }> | null;
  status: null | string;
};

const fakeOctokit = (runs: WorkflowRun[], calls: Call[]): Octokit =>
  ({
    actions: {
      listWorkflowRuns: async () => ({ data: { workflow_runs: runs } }),
    },
    issues: {
      removeLabel: async (args: unknown) => {
        calls.push({ args, method: 'removeLabel' });
      },
    },
    paginate: async () => runs,
  }) as unknown as Octokit;

describe('findRunningE2ERun', () => {
  it('matches a workflow_dispatch run via the "@ PR#<n> retest" display-title marker', async () => {
    const octokit = fakeOctokit(
      [
        {
          display_title: 'Hot Cluster E2E @ PR#42 retest',
          event: 'workflow_dispatch',
          id: 1,
          status: 'in_progress',
        },
      ],
      [],
    );

    const result = await findRunningE2ERun(octokit, 'o', 'r', 42, 'sha1');
    assert.deepEqual(result, { id: 1, status: 'in_progress' });
  });

  it('ignores a workflow_dispatch run for a different PR number', async () => {
    const octokit = fakeOctokit(
      [
        {
          display_title: 'Hot Cluster E2E @ PR#7 retest',
          event: 'workflow_dispatch',
          id: 1,
          status: 'in_progress',
        },
      ],
      [],
    );

    const result = await findRunningE2ERun(octokit, 'o', 'r', 42, 'sha1');
    assert.equal(result, null);
  });

  it('matches a non-dispatch run via pull_requests', async () => {
    const octokit = fakeOctokit(
      [{ event: 'push', id: 2, pull_requests: [{ number: 42 }], status: 'queued' }],
      [],
    );

    const result = await findRunningE2ERun(octokit, 'o', 'r', 42, 'sha1');
    assert.deepEqual(result, { id: 2, status: 'queued' });
  });

  it('falls back to head_sha when pull_requests is empty/null', async () => {
    const octokit = fakeOctokit(
      [{ event: 'push', head_sha: 'sha1', id: 3, pull_requests: null, status: 'queued' }],
      [],
    );

    const result = await findRunningE2ERun(octokit, 'o', 'r', 42, 'sha1');
    assert.deepEqual(result, { id: 3, status: 'queued' });
  });

  it('falls back to head_sha when pull_requests is an empty array (not just null)', async () => {
    const octokit = fakeOctokit(
      [{ event: 'push', head_sha: 'sha1', id: 6, pull_requests: [], status: 'queued' }],
      [],
    );

    const result = await findRunningE2ERun(octokit, 'o', 'r', 42, 'sha1');
    assert.deepEqual(result, { id: 6, status: 'queued' });
  });

  it('returns null when no candidate is still running', async () => {
    const octokit = fakeOctokit(
      [{ event: 'push', id: 4, pull_requests: [{ number: 42 }], status: 'completed' }],
      [],
    );

    const result = await findRunningE2ERun(octokit, 'o', 'r', 42, 'sha1');
    assert.equal(result, null);
  });

  it('returns null when no run matches this PR at all', async () => {
    const octokit = fakeOctokit(
      [{ event: 'push', head_sha: 'other-sha', id: 5, pull_requests: [], status: 'queued' }],
      [],
    );

    const result = await findRunningE2ERun(octokit, 'o', 'r', 42, 'sha1');
    assert.equal(result, null);
  });
});

describe('liftE2EHold', () => {
  const tmpFile = join(tmpdir(), `gh-output-e2e-dispatch-test-${process.pid}.txt`);
  const originalEnv = process.env.GITHUB_OUTPUT;

  beforeEach(() => {
    writeFileSync(tmpFile, '');
    process.env.GITHUB_OUTPUT = tmpFile;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.GITHUB_OUTPUT;
    } else {
      process.env.GITHUB_OUTPUT = originalEnv;
    }
    try {
      unlinkSync(tmpFile);
    } catch {
      /* ignore */
    }
  });

  it('removes the label and sets was_held=true on success', async () => {
    const calls: Call[] = [];
    const octokit = fakeOctokit([], calls);

    await liftE2EHold(octokit, 'o', 'r', 42);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'removeLabel');
    assert.deepEqual(calls[0].args, { issue_number: 42, name: 'e2e-hold', owner: 'o', repo: 'r' });
    assert.equal(readFileSync(tmpFile, 'utf8'), 'was_held=true\n');
  });

  it('sets was_held=false on a 404 (no hold was present)', async () => {
    const octokit = {
      issues: {
        removeLabel: async () => {
          const err = new Error('Not Found') as Error & { status: number };
          err.status = 404;
          throw err;
        },
      },
    } as unknown as Octokit;

    await liftE2EHold(octokit, 'o', 'r', 42);

    assert.equal(readFileSync(tmpFile, 'utf8'), 'was_held=false\n');
  });

  it('sets removal_failed=true on an unexpected error, without throwing', async () => {
    const octokit = {
      issues: {
        removeLabel: async () => {
          throw new Error('boom');
        },
      },
    } as unknown as Octokit;

    await liftE2EHold(octokit, 'o', 'r', 42);

    assert.equal(readFileSync(tmpFile, 'utf8'), 'removal_failed=true\n');
  });
});
