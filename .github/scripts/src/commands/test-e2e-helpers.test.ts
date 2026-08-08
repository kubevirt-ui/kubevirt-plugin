import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildTestE2EReport, parseTestE2ECommand } from './test-e2e-helpers';

describe('parseTestE2ECommand', () => {
  it('parses suite-only commands', () => {
    assert.deepEqual(parseTestE2ECommand('/test-e2e tier1'), {
      testArgs: '',
      testProject: 'tier1',
    });
    assert.deepEqual(parseTestE2ECommand('/test-e2e Tier2'), {
      testArgs: '',
      testProject: 'tier2',
    });
    assert.deepEqual(parseTestE2ECommand('/test-e2e suite'), {
      testArgs: '',
      testProject: 'suite',
    });
  });

  it('parses optional Playwright args', () => {
    assert.deepEqual(parseTestE2ECommand('/test-e2e tier1 playwright/tests/tier1/foo.spec.ts'), {
      testArgs: 'playwright/tests/tier1/foo.spec.ts',
      testProject: 'tier1',
    });
    assert.deepEqual(parseTestE2ECommand('/test-e2e gating -g MyTestName'), {
      testArgs: '-g MyTestName',
      testProject: 'gating',
    });
  });

  it('parses filter-only commands without a suite (auto)', () => {
    assert.deepEqual(
      parseTestE2ECommand(
        '/test-e2e playwright/tests/tier1/bootable-volumes/bootable-volumes.spec.ts',
      ),
      {
        testArgs: 'playwright/tests/tier1/bootable-volumes/bootable-volumes.spec.ts',
        testProject: 'auto',
      },
    );
    assert.deepEqual(parseTestE2ECommand('/test-e2e -g "creates a bootable volume"'), {
      testArgs: '-g "creates a bootable volume"',
      testProject: 'auto',
    });
    assert.deepEqual(parseTestE2ECommand('/test-e2e auto -g "creates a bootable volume"'), {
      testArgs: '-g "creates a bootable volume"',
      testProject: 'auto',
    });
  });

  it('strips invisible bidi / zero-width marks from copied spec paths', () => {
    assert.deepEqual(
      parseTestE2ECommand('/test-e2e tier1 playwright/tests/tier1/foo.spec.ts\u200e'),
      {
        testArgs: 'playwright/tests/tier1/foo.spec.ts',
        testProject: 'tier1',
      },
    );
  });

  it('returns null when suite/args are missing, and treats unknown first tokens as args', () => {
    assert.equal(parseTestE2ECommand('/test-e2e'), null);
    assert.equal(parseTestE2ECommand('/retest-e2e'), null);
    assert.deepEqual(parseTestE2ECommand('/test-e2e nope'), {
      testArgs: 'nope',
      testProject: 'auto',
    });
  });

  it('ignores surrounding comment text when the command is on its own line', () => {
    assert.deepEqual(parseTestE2ECommand('please run\n/test-e2e tier2\nthanks'), {
      testArgs: '',
      testProject: 'tier2',
    });
  });
});

describe('buildTestE2EReport', () => {
  it('warns for ad-hoc runs and omits the warning for unfiltered gating', () => {
    assert.match(buildTestE2EReport('o', 'r', 'tier1', ''), /does \*\*not\*\* update/);
    assert.match(buildTestE2EReport('o', 'r', 'gating', '-g Foo'), /does \*\*not\*\* update/);
    assert.match(buildTestE2EReport('o', 'r', 'auto', 'foo.spec.ts'), /does \*\*not\*\* update/);
    assert.doesNotMatch(buildTestE2EReport('o', 'r', 'gating', ''), /does \*\*not\*\* update/);
  });
});
