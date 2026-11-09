import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import {
  closeOrphanedCheckRuns,
  parseWorkflowRunIdFromUrl,
} from './close-orphaned-checks';

describe('parseWorkflowRunIdFromUrl', () => {
  it('parses a standard actions run URL', () => {
    assert.equal(
      parseWorkflowRunIdFromUrl('https://github.com/org/repo/actions/runs/12345'),
      12345,
    );
  });

  it('returns null for missing or unrelated URLs', () => {
    assert.equal(parseWorkflowRunIdFromUrl(null), null);
    assert.equal(parseWorkflowRunIdFromUrl(''), null);
    assert.equal(parseWorkflowRunIdFromUrl('https://github.com/org/repo/pulls/1'), null);
  });
});

type FakeCheck = {
  details_url?: string;
  id: number;
  status: string;
};

type FakeWorkflowRun = {
  id: number;
  status: string;
};

const fakeOctokit = (opts: {
  checks: FakeCheck[];
  updates: number[];
  workflowRuns: Record<number, FakeWorkflowRun>;
}): Octokit =>
  ({
    actions: {
      getWorkflowRun: async ({ run_id }: { run_id: number }) => {
        const run = opts.workflowRuns[run_id];
        if (!run) {
          throw new Error(`workflow run ${run_id} not found`);
        }
        return { data: run };
      },
    },
    checks: {
      listForRef: async () => opts.checks,
      update: async ({ check_run_id }: { check_run_id: number }) => {
        opts.updates.push(check_run_id);
        return {};
      },
    },
    paginate: async (_method: unknown, _params: unknown) => opts.checks,
  }) as unknown as Octokit;

describe('closeOrphanedCheckRuns', () => {
  const currentUrl = 'https://github.com/org/repo/actions/runs/200';
  const olderUrl = 'https://github.com/org/repo/actions/runs/100';
  const newerUrl = 'https://github.com/org/repo/actions/runs/300';

  it('closes only older inactive-run checks, keeps newer/active checks', async () => {
    const updates: number[] = [];
    const octokit = fakeOctokit({
      checks: [
        { details_url: currentUrl, id: 20, status: 'completed' },
        { details_url: olderUrl, id: 10, status: 'in_progress' },
        { details_url: newerUrl, id: 30, status: 'in_progress' },
        {
          details_url: 'https://github.com/org/repo/actions/runs/150',
          id: 15,
          status: 'in_progress',
        },
      ],
      updates,
      workflowRuns: {
        100: { id: 100, status: 'completed' },
        150: { id: 150, status: 'in_progress' },
        300: { id: 300, status: 'queued' },
      },
    });

    await closeOrphanedCheckRuns(
      octokit,
      'org',
      'repo',
      'abc',
      'Run Gating Tests',
      20,
      currentUrl,
    );

    assert.deepEqual(updates, [10]);
  });

  it('skips checks with no parseable details_url', async () => {
    const updates: number[] = [];
    const octokit = fakeOctokit({
      checks: [
        { details_url: currentUrl, id: 20, status: 'completed' },
        { id: 11, status: 'in_progress' },
      ],
      updates,
      workflowRuns: {},
    });

    await closeOrphanedCheckRuns(
      octokit,
      'org',
      'repo',
      'abc',
      'Run Gating Tests',
      20,
      currentUrl,
    );

    assert.deepEqual(updates, []);
  });
});
