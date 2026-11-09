import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  hasOnlineScaleSetRunner,
  hasPeerExecuteInProgress,
  isExecuteTestsJobName,
  resolveClusterFromHotClusterE2ETitle,
  resolveClusterFromWorkflowTitle,
  runnerBelongsToScaleSet,
  summarizeScaleSetRunners,
} from './runner-match';

describe('runnerBelongsToScaleSet', () => {
  it('matches by label', () => {
    assert.equal(
      runnerBelongsToScaleSet(
        { labels: [{ name: 'kubevirt-plugin-ci' }], name: 'unrelated' },
        'kubevirt-plugin-ci',
      ),
      true,
    );
  });

  it('treats populated labels as authoritative and skips name fallback', () => {
    assert.equal(
      runnerBelongsToScaleSet(
        {
          labels: [{ name: 'self-hosted' }, { name: 'Linux' }],
          name: 'kubevirt-plugin-ci-x28cp-runner-5z52x',
        },
        'kubevirt-plugin-ci',
      ),
      false,
    );
  });

  it('matches by ARC ephemeral name prefix when labels are empty', () => {
    assert.equal(
      runnerBelongsToScaleSet(
        { labels: [], name: 'kubevirt-plugin-ci-x28cp-runner-5z52x', status: 'online' },
        'kubevirt-plugin-ci',
      ),
      true,
    );
  });

  it('does not match an unrelated runner name', () => {
    assert.equal(
      runnerBelongsToScaleSet(
        { labels: [], name: 'kubevirt-plugin-50-abc-runner-xyz', status: 'online' },
        'kubevirt-plugin-ci',
      ),
      false,
    );
  });

  it('requires the scale-set name plus a hyphen, not a bare substring', () => {
    assert.equal(
      runnerBelongsToScaleSet(
        { labels: [], name: 'kubevirt-plugin-cix-runner-1' },
        'kubevirt-plugin-ci',
      ),
      false,
    );
  });
});


describe('hasOnlineScaleSetRunner / summarizeScaleSetRunners', () => {
  it('treats empty-label online name-prefix runners as healthy capacity', () => {
    const runners = [
      {
        busy: true,
        labels: [] as Array<{ name: string }>,
        name: 'kubevirt-plugin-ci-x28cp-runner-5z52x',
        status: 'online',
      },
      {
        busy: true,
        labels: [],
        name: 'kubevirt-plugin-ci-x28cp-runner-x7jc5',
        status: 'online',
      },
    ];

    assert.equal(hasOnlineScaleSetRunner(runners, 'kubevirt-plugin-ci'), true);
    assert.deepEqual(summarizeScaleSetRunners(runners, 'kubevirt-plugin-ci'), {
      busy: 2,
      online: 2,
      total: 2,
    });
  });

  it('returns false when online runners belong to another scale set', () => {
    const runners = [
      {
        busy: false,
        labels: [],
        name: 'kubevirt-plugin-50-runner-abc',
        status: 'online',
      },
    ];

    assert.equal(hasOnlineScaleSetRunner(runners, 'kubevirt-plugin-ci'), false);
  });
});

describe('resolveClusterFromHotClusterE2ETitle', () => {
  it('parses the cluster: prefix', () => {
    assert.equal(
      resolveClusterFromHotClusterE2ETitle(
        'Hot Cluster E2E [gating] [cluster:kubevirt-plugin-ci] @ PR#5058 retest',
      ),
      'kubevirt-plugin-ci',
    );
  });

  it('returns null for unrelated titles', () => {
    assert.equal(resolveClusterFromHotClusterE2ETitle('Code Checks'), null);
  });
});

describe('resolveClusterFromWorkflowTitle', () => {
  it('parses parent Hot Cluster E2E titles', () => {
    assert.equal(
      resolveClusterFromWorkflowTitle(
        'Hot Cluster E2E [gating] [cluster:kubevirt-plugin-ci] @ PR#5058 retest',
      ),
      'kubevirt-plugin-ci',
    );
  });

  it('parses standalone Hot Cluster E2E Run titles', () => {
    assert.equal(
      resolveClusterFromWorkflowTitle('Hot Cluster E2E Run [kubevirt-plugin-ci]'),
      'kubevirt-plugin-ci',
    );
  });

  it('returns null for unrelated titles', () => {
    assert.equal(resolveClusterFromWorkflowTitle('Code Checks'), null);
  });
});

describe('isExecuteTestsJobName', () => {
  it('matches reusable and standalone Execute job names', () => {
    assert.equal(isExecuteTestsJobName('Run E2E Tests / Execute tests'), true);
    assert.equal(isExecuteTestsJobName('Execute tests'), true);
    assert.equal(isExecuteTestsJobName('Execute tests (standalone dispatch)'), true);
    assert.equal(isExecuteTestsJobName('Watch for Runner Pickup'), false);
  });
});

describe('hasPeerExecuteInProgress', () => {
  it('returns true for a same-cluster peer with Execute tests in_progress', () => {
    assert.equal(
      hasPeerExecuteInProgress({
        clusterName: 'kubevirt-plugin-ci',
        currentRunId: '42684297722',
        jobsByRunId: {
          '42683560557': [{ name: 'Run E2E Tests / Execute tests', status: 'in_progress' }],
        },
        runs: [
          {
            display_title: 'Hot Cluster E2E [gating] [cluster:kubevirt-plugin-ci] @ PR#5053 retest',
            id: 42683560557,
          },
        ],
      }),
      true,
    );
  });

  it('matches peers by cluster name even when it differs from a custom runner label', () => {
    assert.equal(
      hasPeerExecuteInProgress({
        clusterName: 'kubevirt-plugin-ci',
        currentRunId: '1',
        jobsByRunId: {
          '2': [{ name: 'Run E2E Tests / Execute tests', status: 'in_progress' }],
        },
        runs: [
          {
            display_title: 'Hot Cluster E2E [gating] [cluster:kubevirt-plugin-ci] @ PR#2',
            id: 2,
          },
        ],
      }),
      true,
    );
  });

  it('matches standalone Hot Cluster E2E Run peers by bracketed cluster name', () => {
    assert.equal(
      hasPeerExecuteInProgress({
        clusterName: 'kubevirt-plugin-ci',
        currentRunId: '1',
        jobsByRunId: {
          '3': [{ name: 'Execute tests (standalone dispatch)', status: 'in_progress' }],
        },
        runs: [
          {
            display_title: 'Hot Cluster E2E Run [kubevirt-plugin-ci]',
            id: 3,
          },
        ],
      }),
      true,
    );
  });

  it('ignores the current run and other clusters', () => {
    assert.equal(
      hasPeerExecuteInProgress({
        clusterName: 'kubevirt-plugin-ci',
        currentRunId: '111',
        jobsByRunId: {
          '111': [{ name: 'Run E2E Tests / Execute tests', status: 'in_progress' }],
          '222': [{ name: 'Run E2E Tests / Execute tests', status: 'in_progress' }],
        },
        runs: [
          {
            display_title: 'Hot Cluster E2E [gating] [cluster:kubevirt-plugin-ci] @ PR#1',
            id: 111,
          },
          {
            display_title: 'Hot Cluster E2E [gating] [cluster:kubevirt-plugin-50] @ PR#2',
            id: 222,
          },
        ],
      }),
      false,
    );
  });
});
