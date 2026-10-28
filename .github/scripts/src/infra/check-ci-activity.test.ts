import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Octokit } from '@octokit/rest';

import {
  checkBusyClusters,
  hasActiveWorkflows,
  resolveClusterFromTitle,
} from './check-ci-activity';

type ListParams = { status?: string; workflow_id?: string };

type FakeRun = { display_title: string };

const fakeOctokit = (runsByStatus: Record<string, FakeRun[]>, calls: ListParams[]): Octokit =>
  ({
    actions: {
      listWorkflowRuns: async () => ({ data: { workflow_runs: [] } }),
    },
    paginate: async (_method: unknown, params: ListParams) => {
      calls.push(params);
      return runsByStatus[params.status ?? ''] ?? [];
    },
  }) as unknown as Octokit;

describe('resolveClusterFromTitle', () => {
  it('reads the branch/cluster from the second bracket, not the test_project', () => {
    assert.equal(
      resolveClusterFromTitle('Hot Cluster E2E [gating] [release-4.23] @ PR#4912 retest'),
      'kubevirt-plugin-423',
    );
  });

  it('handles a different test_project token and release-5.0', () => {
    assert.equal(
      resolveClusterFromTitle('Hot Cluster E2E [auto] [release-5.0] @ PR#4910 retest'),
      'kubevirt-plugin-50',
    );
  });

  it('maps the main branch to the default cluster', () => {
    assert.equal(
      resolveClusterFromTitle('Hot Cluster E2E [gating] [main] @ PR#4914 retest'),
      'kubevirt-plugin-ci',
    );
  });

  it('passes through an already-resolved cluster name verbatim', () => {
    assert.equal(
      resolveClusterFromTitle('Hot Cluster E2E [gating] [kubevirt-plugin-ci] @ main'),
      'kubevirt-plugin-ci',
    );
  });

  it('returns null for a non-matching title', () => {
    assert.equal(resolveClusterFromTitle('Some Other Workflow [gating] [release-4.23]'), null);
  });

  it('returns a custom cluster name verbatim (non-release / main base titles)', () => {
    assert.equal(
      resolveClusterFromTitle('Hot Cluster E2E [gating] [gal-custom] @ PR#42 retest'),
      'gal-custom',
    );
  });

  it('maps malformed release-4.21-test title tokens to the default cluster', () => {
    assert.equal(
      resolveClusterFromTitle('Hot Cluster E2E [gating] [release-4.21-test] @ PR#1'),
      'kubevirt-plugin-ci',
    );
  });

  it('parses cluster: prefix so custom names like main / release-test are unambiguous', () => {
    assert.equal(
      resolveClusterFromTitle('Hot Cluster E2E [gating] [cluster:main] @ PR#1 retest'),
      'main',
    );
    assert.equal(
      resolveClusterFromTitle('Hot Cluster E2E [gating] [cluster:release-test] @ PR#2'),
      'release-test',
    );
    assert.equal(
      resolveClusterFromTitle(
        'Hot Cluster E2E [gating] [cluster:kubevirt-plugin-421] @ PR#3 retest',
      ),
      'kubevirt-plugin-421',
    );
  });
});

describe('hasActiveWorkflows', () => {
  it('counts queued runs for the target cluster as active, not just in_progress', async () => {
    const calls: ListParams[] = [];
    // No in_progress runs at all -- only a queued one (e.g. stuck behind a
    // runner-capacity backlog). This is exactly the state that previously
    // slipped past this check and let a teardown proceed.
    const octokit = fakeOctokit(
      {
        in_progress: [],
        queued: [
          {
            display_title: 'Hot Cluster E2E [gating] [release-4.15] @ PR#1 retest',
          },
        ],
      },
      calls,
    );

    const total = await hasActiveWorkflows(octokit, 'o', 'r', 'kubevirt-plugin-415', [
      '.github/workflows/hot-cluster-e2e.yml',
    ]);

    assert.equal(total, 1);
  });

  it('matches a custom-cluster run titled for base_ref=main during teardown checks', async () => {
    // hot-cluster-e2e.yml run-name uses cluster:<name> for the second bracket.
    const title = 'Hot Cluster E2E [gating] [cluster:gal-custom] @ PR#42 retest';
    assert.equal(resolveClusterFromTitle(title), 'gal-custom');

    const calls: ListParams[] = [];
    const octokit = fakeOctokit(
      {
        in_progress: [],
        queued: [{ display_title: title }],
      },
      calls,
    );

    assert.equal(
      await hasActiveWorkflows(octokit, 'o', 'r', 'gal-custom', [
        '.github/workflows/hot-cluster-e2e.yml',
      ]),
      1,
    );
    assert.equal(
      await hasActiveWorkflows(octokit, 'o', 'r', 'kubevirt-plugin-ci', [
        '.github/workflows/hot-cluster-e2e.yml',
      ]),
      0,
    );
  });

  it('ignores active runs for a different cluster', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit(
      {
        in_progress: [],
        queued: [
          {
            display_title: 'Hot Cluster E2E [gating] [release-4.21] @ PR#4975 retest',
          },
          {
            display_title: 'Hot Cluster E2E [gating] [release-4.21] @ PR#4973 retest',
          },
        ],
      },
      calls,
    );

    // Teardown of 4.15 must not be blocked by queued 4.21 E2E.
    const total = await hasActiveWorkflows(octokit, 'o', 'r', 'kubevirt-plugin-415', [
      '.github/workflows/hot-cluster-e2e.yml',
    ]);

    assert.equal(total, 0);
  });

  it('still blocks teardown when the matching cluster has active runs', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit(
      {
        in_progress: [
          {
            display_title: 'Hot Cluster E2E [gating] [release-4.15] @ PR#9',
          },
        ],
        queued: [
          {
            display_title: 'Hot Cluster E2E [gating] [release-4.21] @ PR#4975 retest',
          },
        ],
      },
      calls,
    );

    const total = await hasActiveWorkflows(octokit, 'o', 'r', 'kubevirt-plugin-415', [
      '.github/workflows/hot-cluster-e2e.yml',
    ]);

    assert.equal(total, 1);
  });

  it('matches setup workflows by [clusterName] in the title', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit(
      {
        in_progress: [
          { display_title: 'IBM Cloud Hot Cluster Setup [kubevirt-plugin-415]' },
        ],
        queued: [
          { display_title: 'IBM Cloud Hot Cluster Setup [kubevirt-plugin-421]' },
        ],
      },
      calls,
    );

    const total = await hasActiveWorkflows(octokit, 'o', 'r', 'kubevirt-plugin-415', [
      '.github/workflows/ibmc-cluster-setup.yml',
    ]);

    assert.equal(total, 1);
  });

  it('queries both in_progress and queued for every workflow', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit({ in_progress: [], queued: [] }, calls);

    await hasActiveWorkflows(octokit, 'o', 'r', 'kubevirt-plugin-ci', ['a.yml', 'b.yml']);

    const statusesQueried = calls.map((call) => call.status).sort();
    assert.deepEqual(statusesQueried, ['in_progress', 'in_progress', 'queued', 'queued']);
    assert.deepEqual(new Set(calls.map((call) => call.workflow_id)), new Set(['a.yml', 'b.yml']));
  });

  it('sums matching counts across both statuses and all workflows', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit(
      {
        in_progress: [
          { display_title: 'Hot Cluster E2E [gating] [main] @ PR#1' },
          { display_title: 'Hot Cluster E2E [gating] [main] @ PR#2' },
        ],
        queued: [
          { display_title: 'Hot Cluster E2E [gating] [main] @ PR#3' },
          { display_title: 'Hot Cluster E2E [gating] [main] @ PR#4' },
          { display_title: 'Hot Cluster E2E [gating] [main] @ PR#5' },
        ],
      },
      calls,
    );

    const total = await hasActiveWorkflows(octokit, 'o', 'r', 'kubevirt-plugin-ci', [
      '.github/workflows/hot-cluster-e2e.yml',
    ]);

    // 2 in_progress + 3 queued for the matching cluster
    assert.equal(total, 5);
  });

  it('returns 0 when nothing is in_progress or queued for the cluster', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit({ in_progress: [], queued: [] }, calls);

    const total = await hasActiveWorkflows(octokit, 'o', 'r', 'kubevirt-plugin-415', [
      '.github/workflows/hot-cluster-e2e.yml',
    ]);

    assert.equal(total, 0);
  });
});

describe('checkBusyClusters', () => {
  it('recognizes a queued run titled with cluster: default-cluster prefix', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit(
      {
        in_progress: [],
        queued: [
          {
            display_title:
              'Hot Cluster E2E [gating] [cluster:kubevirt-plugin-ci] @ PR#1 retest',
          },
        ],
      },
      calls,
    );

    const busy = await checkBusyClusters(octokit, 'o', 'r', ['kubevirt-plugin-ci'], [
      '.github/workflows/hot-cluster-e2e.yml',
    ]);

    assert.deepEqual(busy, ['kubevirt-plugin-ci']);
  });

  it('does not mark a cluster busy for a different cluster: title', async () => {
    const calls: ListParams[] = [];
    const octokit = fakeOctokit(
      {
        in_progress: [],
        queued: [
          {
            display_title:
              'Hot Cluster E2E [gating] [cluster:kubevirt-plugin-421] @ PR#1 retest',
          },
        ],
      },
      calls,
    );

    const busy = await checkBusyClusters(octokit, 'o', 'r', ['kubevirt-plugin-ci'], [
      '.github/workflows/hot-cluster-e2e.yml',
    ]);

    assert.deepEqual(busy, []);
  });
});
