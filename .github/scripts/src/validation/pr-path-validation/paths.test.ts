import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getSensitivePaths, isSensitivePath } from './paths';
import type { PathValidationConfig } from './types';

const TEST_CONFIG: PathValidationConfig = {
  exactPaths: ['Dockerfile'],
  pathPrefixes: ['.github/'],
  relatedAutomationPaths: ['scripts/build.sh'],
  relatedAutomationPrefixes: ['tools/'],
  labels: { alert: 'alert', block: 'block', reviewed: 'reviewed', skip: 'skip' },
  labelMeta: {
    alert: { color: 'f59e0b', description: 'alert' },
    block: { color: 'b60205', description: 'block' },
  },
  statusContext: 'test-validation',
  displayName: 'Test validation',
  commandName: '/test-approved',
};

describe('isSensitivePath edge cases', () => {
  it('strips a single leading slash before matching', () => {
    assert.equal(isSensitivePath('/Dockerfile', TEST_CONFIG), true);
    assert.equal(isSensitivePath('/.github/workflows/foo.yml', TEST_CONFIG), true);
  });

  it('treats an empty string as not sensitive', () => {
    assert.equal(isSensitivePath('', TEST_CONFIG), false);
  });

  it('does not match a prefix-boundary near-miss', () => {
    assert.equal(isSensitivePath('.github-extra/foo.yml', TEST_CONFIG), false);
    assert.equal(isSensitivePath('tools-extra/build.sh', TEST_CONFIG), false);
  });

  it('matches an exact path only as a full match, not a prefix', () => {
    assert.equal(isSensitivePath('Dockerfile', TEST_CONFIG), true);
    assert.equal(isSensitivePath('Dockerfile.dev', TEST_CONFIG), false);
    assert.equal(isSensitivePath('sub/Dockerfile', TEST_CONFIG), false);
  });

  it('matches relatedAutomationPaths and relatedAutomationPrefixes', () => {
    assert.equal(isSensitivePath('scripts/build.sh', TEST_CONFIG), true);
    assert.equal(isSensitivePath('tools/deploy.sh', TEST_CONFIG), true);
  });

  it('is unaffected when relatedAutomationPaths/Prefixes are omitted', () => {
    const minimalConfig: PathValidationConfig = {
      ...TEST_CONFIG,
      relatedAutomationPaths: undefined,
      relatedAutomationPrefixes: undefined,
    };
    assert.equal(isSensitivePath('scripts/build.sh', minimalConfig), false);
    assert.equal(isSensitivePath('Dockerfile', minimalConfig), true);
  });
});

describe('getSensitivePaths edge cases', () => {
  it('returns an empty array for an empty input list', () => {
    assert.deepEqual(getSensitivePaths([], TEST_CONFIG), []);
  });

  it('returns an empty array when nothing matches', () => {
    assert.deepEqual(getSensitivePaths(['src/App.tsx', 'README.md'], TEST_CONFIG), []);
  });
});
