import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  releaseClusterNameMismatch,
  validateDispatchCluster,
} from './validate-dispatch-cluster';

describe('releaseClusterNameMismatch', () => {
  it('returns null for non-release bases (custom clusters allowed)', () => {
    assert.equal(releaseClusterNameMismatch('main', 'gal-custom'), null);
    assert.equal(releaseClusterNameMismatch('main', 'kubevirt-plugin-ci'), null);
  });

  it('returns null when exact release cluster_name matches the derived cluster', () => {
    assert.equal(releaseClusterNameMismatch('release-4.21', 'kubevirt-plugin-421'), null);
  });

  it('returns the expected cluster when exact release cluster_name mismatches', () => {
    assert.equal(
      releaseClusterNameMismatch('release-4.21', 'kubevirt-plugin-ci'),
      'kubevirt-plugin-421',
    );
    assert.equal(
      releaseClusterNameMismatch('release-4.21', 'gal-custom'),
      'kubevirt-plugin-421',
    );
  });
});

describe('validateDispatchCluster', () => {
  it('rejects malformed release-prefixed base_ref', () => {
    assert.match(
      validateDispatchCluster('release-4.21-test', 'kubevirt-plugin-ci') ?? '',
      /not exact release-X\.Y/,
    );
  });

  it('rejects exact release when cluster_name does not match the derived cluster', () => {
    const error = validateDispatchCluster('release-4.21', 'kubevirt-plugin-ci');
    assert.match(error ?? '', /requires cluster_name='kubevirt-plugin-421'/);
    assert.match(error ?? '', /got 'kubevirt-plugin-ci'/);
  });

  it('accepts exact release when cluster_name matches (run-name stays consistent)', () => {
    assert.equal(validateDispatchCluster('release-4.21', 'kubevirt-plugin-421'), null);
  });

  it('rejects a release cluster_name with surrounding whitespace', () => {
    const error = validateDispatchCluster('release-4.21', ' kubevirt-plugin-421 ');
    assert.match(error ?? '', /requires cluster_name='kubevirt-plugin-421'/);
    assert.match(error ?? '', /got ' kubevirt-plugin-421 '/);
  });

  it('preserves non-release dispatches with custom or default cluster_name', () => {
    assert.equal(validateDispatchCluster('main', 'kubevirt-plugin-ci'), null);
    assert.equal(validateDispatchCluster('main', 'gal-custom'), null);
    assert.equal(validateDispatchCluster('', 'kubevirt-plugin-ci'), null);
  });

  it('allows documented custom cluster names that look like legacy branch tokens', () => {
    // run-name uses [cluster:main] / [cluster:release-test], so these are safe.
    assert.equal(validateDispatchCluster('main', 'main'), null);
    assert.equal(validateDispatchCluster('main', 'release-test'), null);
    assert.equal(validateDispatchCluster('', 'release-test'), null);
  });
});
