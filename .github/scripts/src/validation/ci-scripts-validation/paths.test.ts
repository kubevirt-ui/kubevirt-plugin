import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getSensitivePaths, isSensitiveCiScriptsPath } from './paths';

describe('isSensitiveCiScriptsPath', () => {
  it('matches .github/ (workflows, actions, and scripts)', () => {
    assert.equal(isSensitiveCiScriptsPath('.github/workflows/hold-e2e.yml'), true);
    assert.equal(isSensitiveCiScriptsPath('.github/actions/publish-gating-check/action.yml'), true);
    assert.equal(isSensitiveCiScriptsPath('.github/scripts/src/utils.ts'), true);
  });

  it('matches ci-scripts/', () => {
    assert.equal(
      isSensitiveCiScriptsPath('ci-scripts/hot-cluster/arc/install-runner-scale-set.sh'),
      true,
    );
  });

  it('matches the confirmed CI-invoked root files', () => {
    assert.equal(isSensitiveCiScriptsPath('Dockerfile'), true);
    assert.equal(isSensitiveCiScriptsPath('playwright-runner-hc-e2e.sh'), true);
  });

  it('ignores regular application code and local-dev-only root scripts', () => {
    assert.equal(
      isSensitiveCiScriptsPath('src/views/virtualmachines/list/VirtualMachinesList.tsx'),
      false,
    );
    assert.equal(isSensitiveCiScriptsPath('playwright-runner.sh'), false);
    assert.equal(isSensitiveCiScriptsPath('test-setup.sh'), false);
  });
});

describe('getSensitivePaths', () => {
  it('filters only sensitive paths from a changed file list', () => {
    assert.deepEqual(
      getSensitivePaths(['src/App.tsx', 'Dockerfile', '.github/workflows/ci_checks.yml']),
      ['Dockerfile', '.github/workflows/ci_checks.yml'],
    );
  });
});
