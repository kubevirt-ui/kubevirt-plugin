import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  normalizeTestProject,
  resolvePlaywrightProject,
} from './resolve-playwright-test-project';

describe('normalizeTestProject', () => {
  it('defaults blank input to gating', () => {
    assert.equal(normalizeTestProject(undefined), 'gating');
    assert.equal(normalizeTestProject(''), 'gating');
    assert.equal(normalizeTestProject('   '), 'gating');
  });

  it('preserves explicit suite names', () => {
    assert.equal(normalizeTestProject('tier1'), 'tier1');
    assert.equal(normalizeTestProject('  Gating  '), 'Gating');
  });
});

describe('resolvePlaywrightProject', () => {
  it('maps gating to the Gating Playwright project', () => {
    assert.equal(resolvePlaywrightProject('gating'), 'Gating');
    assert.equal(resolvePlaywrightProject(''), 'Gating');
  });

  it('rejects unknown projects', () => {
    assert.throws(() => resolvePlaywrightProject('features'), /Unsupported TEST_PROJECT/);
  });
});
