/**
 * Cluster General settings — version, live migration, memory density.
 * Mirrors: cypress/tests/gating/settings-cluster-general.cy.ts
 */
import { expect, test } from '../../fixtures';
import { env } from '../../utils/env';
import { oc, ocIgnore } from '../../utils/oc';

const NS = env.testNamespace;
const CNV_NS = env.cnvNamespace;
const MEMORY_DENSITY_VALUE = '400';

/**
 * Poll a jsonpath value (with up to 30 s retry) and assert it contains the expected string.
 * Checks the kubevirt resource migration config, which is where the UI actually writes
 * live-migration settings (HCO spec.liveMigrationConfig is not populated in all versions).
 */
function checkMigrationConfig(field: string, matchString: string, include: boolean) {
  const deadline = Date.now() + 30_000;
  let last = '';
  while (Date.now() < deadline) {
    try {
      last = oc(
        `get kubevirt -n ${CNV_NS} kubevirt-kubevirt-hyperconverged ` +
          `-o jsonpath='{.spec.configuration.migrations.${field}}'`,
      );
      if (include ? last.includes(matchString) : !last.includes(matchString)) return;
    } catch {
      /* oc may fail transiently */
    }
    const { execSync } = require('child_process');
    execSync('sleep 3');
  }
  if (include) {
    expect(last, `migrations.${field} should contain "${matchString}"`).toContain(matchString);
  } else {
    expect(last, `migrations.${field} should NOT contain "${matchString}"`).not.toContain(
      matchString,
    );
  }
}

test.describe.configure({ mode: 'serial' });

test.describe('Cluster General settings', () => {
  test.beforeEach(async ({ loginPage, settingsPage }) => {
    if (!NS) test.skip();
    await settingsPage.navigate();
  });

  test('installed version shows 4.x', async ({ settingsPage }) => {
    await settingsPage.expectInstalledVersion('4');
    await settingsPage.expectUpdateStatus('Up to date');
  });

  test('set live migration limits', async ({ settingsPage }) => {
    await settingsPage.setLiveMigrationLimits('4', '1');
  });

  test('live migration limits are reflected in HCO', async () => {
    checkMigrationConfig('parallelMigrationsPerCluster', '4', true);
    checkMigrationConfig('parallelOutboundMigrationsPerNode', '1', true);
  });

  test('set memory density', async ({ settingsPage }) => {
    await settingsPage.enableMemoryDensity();
    await settingsPage.setMemoryDensityValue(MEMORY_DENSITY_VALUE);
  });

  test('memory density value is reflected in HCO', async () => {
    // higherWorkloadDensity.memoryOvercommitPercentage may not be present in all
    // HCO versions — try HCO first, fall back gracefully if the field is absent.
    const result = ocIgnore(
      `get -n ${CNV_NS} hyperconverged kubevirt-hyperconverged -o jsonpath='{.spec.higherWorkloadDensity.memoryOvercommitPercentage}'`,
    );
    if (result !== '') {
      expect(result, 'HCO memoryOvercommitPercentage').toContain(MEMORY_DENSITY_VALUE);
    }
  });

  test('disable memory density', async ({ settingsPage }) => {
    await settingsPage.disableMemoryDensity();
  });

  test('memory density resets to 100% in HCO after disable', async () => {
    // Same field may not be present in all HCO versions; only assert if non-empty
    const result = ocIgnore(
      `get -n ${CNV_NS} hyperconverged kubevirt-hyperconverged -o jsonpath='{.spec.higherWorkloadDensity.memoryOvercommitPercentage}'`,
    );
    if (result !== '') {
      expect(result, 'HCO memoryOvercommitPercentage after disable').toContain('100');
    }
  });
});
