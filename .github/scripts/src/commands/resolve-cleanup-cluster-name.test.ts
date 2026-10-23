import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatManualConsoleDeployNotice,
  formatManualConsoleDeployRecord,
} from './manual-console-cluster-record';
import {
  clusterNameFromDeployComment,
  collectDeployClusterRecordsFromComments,
  newestDeployClusterRecord,
  resolveCleanupClusterName,
} from './resolve-cleanup-cluster-name';

describe('clusterNameFromDeployComment', () => {
  it('extracts the cluster from the post-provision HTML marker', () => {
    assert.equal(
      clusterNameFromDeployComment(formatManualConsoleDeployRecord('kubevirt-plugin-419')),
      'kubevirt-plugin-419',
    );
  });

  it('ignores dispatch notices (no cleanup marker)', () => {
    assert.equal(
      clusterNameFromDeployComment(formatManualConsoleDeployNotice('gal-test-419', 'vpc')),
      undefined,
    );
    assert.equal(
      clusterNameFromDeployComment(
        '🚀 Dispatched a manual console deploy for this PR (cluster `gal-test-419`, infrastructure `vpc`).',
      ),
      undefined,
    );
  });

  it('returns undefined when the comment is unrelated', () => {
    assert.equal(clusterNameFromDeployComment('cleanup only'), undefined);
  });
});

describe('collectDeployClusterRecordsFromComments', () => {
  it('ignores non-bot authors', () => {
    const records = collectDeployClusterRecordsFromComments([
      {
        body: formatManualConsoleDeployRecord('evil-cluster'),
        created_at: '2026-01-02T00:00:00Z',
        user: { login: 'random-user' },
      },
    ]);
    assert.equal(records.length, 0);
  });

  it('ignores a newer dispatch notice and keeps the provisioned record', () => {
    const records = collectDeployClusterRecordsFromComments([
      {
        body: formatManualConsoleDeployRecord('kubevirt-plugin-419'),
        created_at: '2026-01-01T00:00:00Z',
        user: { login: 'github-actions[bot]' },
      },
      {
        body: formatManualConsoleDeployNotice('failed-redeploy-cluster', 'vpc'),
        created_at: '2026-01-03T00:00:00Z',
        user: { login: 'kubevirt-plugin-bot[bot]' },
      },
    ]);
    assert.equal(newestDeployClusterRecord(records), 'kubevirt-plugin-419');
  });

  it('keeps bot provision records and picks the newest by timestamp', () => {
    const records = collectDeployClusterRecordsFromComments([
      {
        body: formatManualConsoleDeployRecord('older-cluster'),
        created_at: '2026-01-01T00:00:00Z',
        user: { login: 'kubevirt-plugin-bot[bot]' },
      },
      {
        body: formatManualConsoleDeployRecord('newer-cluster'),
        created_at: '2026-01-03T00:00:00Z',
        user: { login: 'github-actions[bot]' },
      },
      {
        body: formatManualConsoleDeployRecord('mid-cluster'),
        created_at: '2026-01-02T00:00:00Z',
        user: { login: 'kubevirt-plugin-bot[bot]' },
      },
    ]);
    assert.equal(newestDeployClusterRecord(records), 'newer-cluster');
  });
});

describe('resolveCleanupClusterName', () => {
  it('prefers an explicit cluster name', async () => {
    assert.equal(
      await resolveCleanupClusterName({
        explicitClusterName: 'gal-test-419',
        findRecorded: async () => 'kubevirt-plugin-419',
      }),
      'gal-test-419',
    );
  });

  it('uses the recorded deploy cluster when CLUSTER_NAME is omitted', async () => {
    assert.equal(
      await resolveCleanupClusterName({
        explicitClusterName: '',
        findRecorded: async () => 'kubevirt-plugin-419',
      }),
      'kubevirt-plugin-419',
    );
  });

  it('fails closed when nothing was recorded (no silent baseRef default)', async () => {
    await assert.rejects(
      () =>
        resolveCleanupClusterName({
          explicitClusterName: undefined,
          findRecorded: async () => undefined,
        }),
      /Pass it explicitly/,
    );
  });
});
