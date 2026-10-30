import assert from 'node:assert/strict';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { resolveHcPlaywrightRunner } from './resolve-hc-playwright-runner';

describe('resolveHcPlaywrightRunner', () => {
  it('prefers the product repo root (main / local checkout)', () => {
    const repoRoot = '/work/kubevirt-plugin';
    const productPath = join(repoRoot, 'playwright-runner-hc-e2e.sh');
    const result = resolveHcPlaywrightRunner(repoRoot, (path) => path === productPath);
    assert.equal(result, productPath);
  });

  it('falls back to the .hc-infra overlay (release-branch HC run)', () => {
    const repoRoot = '/work/kubevirt-plugin';
    const overlayPath = join(repoRoot, '.hc-infra', 'playwright-runner-hc-e2e.sh');
    const result = resolveHcPlaywrightRunner(repoRoot, (path) => path === overlayPath);
    assert.equal(result, overlayPath);
  });

  it('prefers the product path over the overlay when both exist', () => {
    const repoRoot = '/work/kubevirt-plugin';
    const productPath = join(repoRoot, 'playwright-runner-hc-e2e.sh');
    const result = resolveHcPlaywrightRunner(repoRoot, () => true);
    assert.equal(result, productPath);
  });

  it('throws a descriptive error when neither location has the script', () => {
    const repoRoot = '/work/kubevirt-plugin';
    assert.throws(
      () => resolveHcPlaywrightRunner(repoRoot, () => false),
      /Could not find playwright-runner-hc-e2e\.sh/,
    );
  });
});
