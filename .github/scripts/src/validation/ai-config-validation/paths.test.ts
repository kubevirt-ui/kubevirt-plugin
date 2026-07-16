import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getSensitivePaths, isSensitiveAiConfigPath } from './paths';

describe('isSensitiveAiConfigPath', () => {
  it('matches AI assistant and editor dot folders', () => {
    assert.equal(isSensitiveAiConfigPath('.cursor/rules/team-review.mdc'), true);
    assert.equal(isSensitiveAiConfigPath('.claude/settings.json'), true);
    assert.equal(isSensitiveAiConfigPath('.vscode/tasks.json'), true);
  });

  it('matches PR automation scripts', () => {
    assert.equal(
      isSensitiveAiConfigPath('.github/scripts/src/ai-config-validation/index.ts'),
      true,
    );
    assert.equal(isSensitiveAiConfigPath('.github/workflows/pr_validation.yml'), true);
  });

  it('ignores regular application code', () => {
    assert.equal(
      isSensitiveAiConfigPath('src/views/virtualmachines/list/VirtualMachinesList.tsx'),
      false,
    );
    assert.equal(isSensitiveAiConfigPath('.github/workflows/ci_checks.yml'), false);
  });
});

describe('getSensitivePaths', () => {
  it('filters only sensitive paths from a changed file list', () => {
    assert.deepEqual(
      getSensitivePaths([
        'src/App.tsx',
        '.vscode/settings.json',
        '.github/scripts/src/pr-validation/index.ts',
      ]),
      ['.vscode/settings.json', '.github/scripts/src/pr-validation/index.ts'],
    );
  });
});
