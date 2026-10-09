import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildAdHocResultComment } from './adhoc-comment';

const baseParams = {
  runUrl: 'https://github.com/org/repo/actions/runs/1',
  testArgs: '',
  testFailureSummary: '',
  testProject: 'auto',
};

describe('buildAdHocResultComment', () => {
  it('reports a failed suite with the test summary', () => {
    const body = buildAdHocResultComment({
      ...baseParams,
      passed: false,
      testFailureSummary: '**1** of **2** tests failed, **1** passed',
    });
    assert.match(body, /^❌ Hot Cluster E2E ad-hoc suite `auto` failed\.$/m);
    assert.match(body, /\*\*1\*\* of \*\*2\*\* tests failed/);
    assert.match(body, /\[View run\]\(https:\/\/github\.com\/org\/repo\/actions\/runs\/1\)/);
  });

  it('reports a passed suite with the test summary', () => {
    const body = buildAdHocResultComment({
      ...baseParams,
      passed: true,
      testFailureSummary: '**0** of **3** tests failed, **3** passed',
    });
    assert.match(body, /^✅ Hot Cluster E2E ad-hoc suite `auto` passed\.$/m);
    assert.match(body, /\*\*3\*\* passed/);
  });

  it('falls back to a short message when no summary is available, without dumping test_args', () => {
    const body = buildAdHocResultComment({
      ...baseParams,
      passed: false,
      testArgs:
        'playwright/tests/vm-wizard/a.spec.ts playwright/tests/virtual-machines/list/b.spec.ts playwright/tests/api/c.spec.ts',
      testFailureSummary: '',
    });
    assert.match(body, /no JUnit results found/);
    assert.ok(!body.includes('playwright/tests/vm-wizard/a.spec.ts'));
  });

  it('surfaces a -g filter but never a multi-path file list', () => {
    const filtered = buildAdHocResultComment({
      ...baseParams,
      passed: false,
      testArgs: '-g "search language"',
      testFailureSummary: '**1** of **1** tests failed, **0** passed',
    });
    assert.match(filtered, /Filter: `-g "search language"`/);

    const multiPath = buildAdHocResultComment({
      ...baseParams,
      passed: false,
      testArgs:
        'playwright/tests/vm-wizard/a.spec.ts playwright/tests/virtual-machines/list/b.spec.ts',
      testFailureSummary: '**1** of **2** tests failed, **1** passed',
    });
    assert.ok(!multiPath.includes('Filter:'));
    assert.ok(!multiPath.includes('playwright/tests/vm-wizard/a.spec.ts'));
  });

  it('shows the suite title for a non-auto project', () => {
    const body = buildAdHocResultComment({
      ...baseParams,
      passed: true,
      testFailureSummary: '**0** of **1** tests failed, **1** passed',
      testProject: 'tier1',
    });
    assert.match(body, /ad-hoc suite `tier1` passed/);
  });
});
