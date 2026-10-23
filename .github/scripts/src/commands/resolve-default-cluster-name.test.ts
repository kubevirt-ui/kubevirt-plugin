import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_HOT_CLUSTER_NAME,
  resolveClusterNameInput,
  resolveDefaultClusterName,
} from './resolve-default-cluster-name';

describe('resolveDefaultClusterName', () => {
  it('maps release-4.19 to kubevirt-plugin-419', () => {
    assert.equal(resolveDefaultClusterName('release-4.19'), 'kubevirt-plugin-419');
  });

  it('maps release-4.22 to kubevirt-plugin-422', () => {
    assert.equal(resolveDefaultClusterName('release-4.22'), 'kubevirt-plugin-422');
  });

  it('defaults main (and other non-release refs) to kubevirt-plugin-ci', () => {
    assert.equal(resolveDefaultClusterName('main'), DEFAULT_HOT_CLUSTER_NAME);
    assert.equal(resolveDefaultClusterName('CNV-123-my-branch'), DEFAULT_HOT_CLUSTER_NAME);
  });
});

describe('resolveClusterNameInput', () => {
  it('prefers an explicit cluster name', () => {
    assert.equal(resolveClusterNameInput('gal-test-419', 'release-4.19'), 'gal-test-419');
  });

  it('treats empty/whitespace as unset and falls back to the branch default', () => {
    assert.equal(resolveClusterNameInput('', 'release-4.19'), 'kubevirt-plugin-419');
    assert.equal(resolveClusterNameInput('   ', 'main'), DEFAULT_HOT_CLUSTER_NAME);
    assert.equal(resolveClusterNameInput(undefined, 'release-4.20'), 'kubevirt-plugin-420');
  });
});
