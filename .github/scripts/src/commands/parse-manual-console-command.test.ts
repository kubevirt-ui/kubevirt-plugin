import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  parseCleanupManualConsoleCommand,
  parseDeployManualConsoleCommand,
} from './parse-manual-console-command';

describe('parseDeployManualConsoleCommand', () => {
  it('matches bare and clustered forms', () => {
    assert.deepEqual(parseDeployManualConsoleCommand('/deploy-manual-console'), {
      clusterName: '',
    });
    assert.deepEqual(parseDeployManualConsoleCommand('/deploy-manual-console gal-test-419'), {
      clusterName: 'gal-test-419',
    });
  });

  it('rejects near-miss names alone', () => {
    assert.equal(parseDeployManualConsoleCommand('/deploy-manual-console-extra'), null);
    assert.equal(parseDeployManualConsoleCommand('/deploy-manual-consoles'), null);
  });

  it('ignores a near-miss prefix and still matches a valid command later', () => {
    assert.deepEqual(
      parseDeployManualConsoleCommand(
        '/deploy-manual-console-extra please use /deploy-manual-console kubevirt-plugin-419',
      ),
      { clusterName: 'kubevirt-plugin-419' },
    );
  });

  it('does not treat a next-line token as the cluster name', () => {
    assert.deepEqual(
      parseDeployManualConsoleCommand('/deploy-manual-console\nkubevirt-plugin-419'),
      { clusterName: '' },
    );
  });
});

describe('parseCleanupManualConsoleCommand', () => {
  it('matches bare and clustered forms', () => {
    assert.deepEqual(parseCleanupManualConsoleCommand('/cleanup-manual-console'), {
      clusterName: '',
    });
    assert.deepEqual(parseCleanupManualConsoleCommand('/cleanup-manual-console gal-test-419'), {
      clusterName: 'gal-test-419',
    });
  });

  it('rejects near-miss names alone', () => {
    assert.equal(parseCleanupManualConsoleCommand('/cleanup-manual-console-extra'), null);
    assert.equal(parseCleanupManualConsoleCommand('/cleanup-manual-consoles'), null);
  });

  it('ignores a near-miss prefix and still matches a valid command later', () => {
    assert.deepEqual(
      parseCleanupManualConsoleCommand(
        'typo /cleanup-manual-console-staging; real: /cleanup-manual-console',
      ),
      { clusterName: '' },
    );
  });

  it('does not treat a next-line token as the cluster name', () => {
    assert.deepEqual(
      parseCleanupManualConsoleCommand('/cleanup-manual-console\ngal-test-419'),
      { clusterName: '' },
    );
  });
});
