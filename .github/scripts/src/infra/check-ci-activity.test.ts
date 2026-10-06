import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import { hasActiveWorkflows } from './check-ci-activity';

type ListParams = { status?: string; workflow_id?: string };

const fakeOctokit = (
  totalCountByStatus: Record<string, number>,
  calls: ListParams[],
): Octokit =>
  ({
    actions: {
      listWorkflowRuns: async (params: ListParams) => {
        calls.push(params);
        const total = totalCountByStatus[params.status ?? ''] ?? 0;
        return { data: { total_count: total } };
      },
    },
  }) as unknown as Octokit;

describe('hasActiveWorkflows', () => {
  it('counts queued runs as active, not just in_progress', async () => {
    const calls: ListParams[] = [];
    // No in_progress runs at all -- only a queued one (e.g. stuck behind a
    // runner-capacity backlog). This is exactly the state that previously
    // slipped past this check and let a teardown proceed.
    const octokit = fakeOctokit({ in_progress: 0, queued: 1 }, calls);

    const total = await hasActiveWorkflows(octokit, 'o', 'r', ['workflow.yml']);

    assert.equal(total, 1);
  });

  it('queries both in_progress and queued for every workflow', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit({ in_progress: 0, queued: 0 }, calls);

    await hasActiveWorkflows(octokit, 'o', 'r', ['a.yml', 'b.yml']);

    const statusesQueried = calls.map((call) => call.status).sort();
    assert.deepEqual(statusesQueried, ['in_progress', 'in_progress', 'queued', 'queued']);
    assert.deepEqual(
      new Set(calls.map((call) => call.workflow_id)),
      new Set(['a.yml', 'b.yml']),
    );
  });

  it('sums counts across both statuses and all workflows', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit({ in_progress: 2, queued: 3 }, calls);

    const total = await hasActiveWorkflows(octokit, 'o', 'r', ['a.yml', 'b.yml']);

    // 2 workflows x (2 in_progress + 3 queued) = 10
    assert.equal(total, 10);
  });

  it('returns 0 when nothing is in_progress or queued', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit({ in_progress: 0, queued: 0 }, calls);

    const total = await hasActiveWorkflows(octokit, 'o', 'r', ['workflow.yml']);

    assert.equal(total, 0);
  });
});
