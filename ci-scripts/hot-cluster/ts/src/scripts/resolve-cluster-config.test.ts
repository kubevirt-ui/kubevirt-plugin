import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveClusterConfig } from './resolve-cluster-config';

describe('resolveClusterConfig', () => {
  it('resolves a release branch to a release-specific cluster', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.21' });
    assert.equal(config.clusterName, 'kubevirt-plugin-421');
    assert.equal(config.openshiftVersion, '4.21_openshift');
    assert.equal(config.cnvPinVersion, '4.21');
    assert.equal(config.cnvChannel, 'stable');
    assert.equal(config.testEngine, 'cypress');
  });

  it('uses playwright for branches after the Cypress cutoff', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.23' });
    assert.equal(config.testEngine, 'playwright');
    assert.equal(config.clusterName, 'kubevirt-plugin-423');
  });

  it('falls back to defaults for main branch', () => {
    const config = resolveClusterConfig({ baseRef: 'main' });
    assert.equal(config.clusterName, 'kubevirt-plugin-ci');
    assert.equal(config.openshiftVersion, '4.22_openshift');
    assert.equal(config.testEngine, 'playwright');
  });

  it('respects workflow_dispatch overrides', () => {
    const config = resolveClusterConfig({
      baseRef: 'main',
      inputClusterName: 'my-cluster',
      inputOpenshiftVersion: '4.20_openshift',
      inputTestEngine: 'cypress',
    });
    assert.equal(config.clusterName, 'my-cluster');
    assert.equal(config.openshiftVersion, '4.20_openshift');
    assert.equal(config.testEngine, 'cypress');
  });

  it('explicit test_engine overrides release branch auto-detection', () => {
    const config = resolveClusterConfig({
      baseRef: 'release-4.21',
      inputTestEngine: 'playwright',
    });
    assert.equal(config.testEngine, 'playwright');
  });

  it('auto test_engine does not override', () => {
    const config = resolveClusterConfig({
      baseRef: 'release-4.21',
      inputTestEngine: 'auto',
    });
    assert.equal(config.testEngine, 'cypress');
  });

  it('explicit cnv_channel clears pinned version', () => {
    const config = resolveClusterConfig({
      baseRef: 'release-4.21',
      inputCnvChannel: 'candidate',
    });
    assert.equal(config.cnvChannel, 'candidate');
    assert.equal(config.cnvPinVersion, '');
  });

  it('sets branchName from baseRef', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.20' });
    assert.equal(config.branchName, 'release-4.20');
  });
});
