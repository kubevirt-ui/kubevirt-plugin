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
    assert.equal(config.cniPlugin, 'OVNKubernetes');
  });

  it('uses playwright for branches after the Cypress cutoff', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.23' });
    assert.equal(config.testEngine, 'playwright');
    assert.equal(config.clusterName, 'kubevirt-plugin-423');
  });

  it('uses playwright for backported migrations listed in PLAYWRIGHT_MIGRATED_RELEASES', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.15' });
    assert.equal(config.testEngine, 'playwright');
    assert.equal(config.clusterName, 'kubevirt-plugin-415');
  });

  it('falls back to defaults for main branch', () => {
    const config = resolveClusterConfig({ baseRef: 'main' });
    assert.equal(config.clusterName, 'kubevirt-plugin-ci');
    assert.equal(config.openshiftVersion, '4.22_openshift');
    assert.equal(config.testEngine, 'playwright');
    assert.equal(config.cniPlugin, 'OVNKubernetes');
  });

  it('treats empty-string overrides as unset (workflow_dispatch defaults)', () => {
    const config = resolveClusterConfig({
      baseRef: 'main',
      inputClusterName: '',
      inputOpenshiftVersion: '',
    });
    assert.equal(config.clusterName, 'kubevirt-plugin-ci');
    assert.equal(config.openshiftVersion, '4.22_openshift');
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
    assert.equal(config.cniPlugin, 'OVNKubernetes');
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

  it('clamps a below-range release branch to the min version (4.18) and unpins CNV', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.12' });
    assert.equal(config.clusterName, 'kubevirt-plugin-412');
    assert.equal(config.openshiftVersion, '4.18_openshift');
    assert.equal(config.cnvPinVersion, '');
    assert.equal(config.cniPlugin, '');
  });

  it('clamps 4.17 (below the 4.18 floor) up to the min version and unpins CNV, using Calico', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.17' });
    assert.equal(config.clusterName, 'kubevirt-plugin-417');
    assert.equal(config.openshiftVersion, '4.18_openshift');
    assert.equal(config.cnvPinVersion, '');
    assert.equal(config.cniPlugin, '');
  });

  it('keeps the min boundary (4.18) unchanged, pinned, and uses Calico (no explicit CNI)', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.18' });
    assert.equal(config.clusterName, 'kubevirt-plugin-418');
    assert.equal(config.openshiftVersion, '4.18_openshift');
    assert.equal(config.cnvPinVersion, '4.18');
    assert.equal(config.cniPlugin, '');
  });

  it('resolves 4.19 pinned with Calico (below the OVN/VPC-CNI floor)', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.19' });
    assert.equal(config.clusterName, 'kubevirt-plugin-419');
    assert.equal(config.openshiftVersion, '4.19_openshift');
    assert.equal(config.cnvPinVersion, '4.19');
    assert.equal(config.cniPlugin, '');
  });

  it('resolves 4.20 pinned with OVNKubernetes (at the OVN/VPC-CNI floor)', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.20' });
    assert.equal(config.openshiftVersion, '4.20_openshift');
    assert.equal(config.cnvPinVersion, '4.20');
    assert.equal(config.cniPlugin, 'OVNKubernetes');
  });

  it('keeps the max boundary (4.22) unchanged and pinned', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.22' });
    assert.equal(config.openshiftVersion, '4.22_openshift');
    assert.equal(config.cnvPinVersion, '4.22');
    assert.equal(config.cniPlugin, 'OVNKubernetes');
  });

  it('clamps an above-range 4.x release branch to the max version and unpins CNV', () => {
    const config = resolveClusterConfig({ baseRef: 'release-4.23' });
    assert.equal(config.clusterName, 'kubevirt-plugin-423');
    assert.equal(config.openshiftVersion, '4.22_openshift');
    assert.equal(config.cnvPinVersion, '');
    assert.equal(config.cniPlugin, 'OVNKubernetes');
  });

  it('clamps a next-major release branch (5.0) to the max version and unpins CNV', () => {
    const config = resolveClusterConfig({ baseRef: 'release-5.0' });
    assert.equal(config.clusterName, 'kubevirt-plugin-50');
    assert.equal(config.openshiftVersion, '4.22_openshift');
    assert.equal(config.cnvPinVersion, '');
    assert.equal(config.cniPlugin, 'OVNKubernetes');
  });

  it('respects a workflow_dispatch openshift_version override below the OVN floor, using Calico', () => {
    const config = resolveClusterConfig({
      baseRef: 'main',
      inputOpenshiftVersion: '4.19_openshift',
    });
    assert.equal(config.openshiftVersion, '4.19_openshift');
    assert.equal(config.cniPlugin, '');
  });
});
