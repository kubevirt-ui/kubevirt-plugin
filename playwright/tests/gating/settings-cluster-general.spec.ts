/**
 * Cluster General settings — version, live migration, memory density.
 * Mirrors: cypress/tests/gating/settings-cluster-general.cy.ts
 */
import { test } from '../../fixtures';
import { MINUTE } from '../../utils/constants';
import { env } from '../../utils/env';
import { waitForJsonpath } from '../../utils/oc';

const CNV_NS = env.cnvNamespace;
const MEMORY_DENSITY_VALUE = '400';
const KUBEVIRT_CR = 'kubevirt/kubevirt-kubevirt-hyperconverged';
const HCO_CR = 'hyperconverged/kubevirt-hyperconverged';
const MIGRATIONS_PATH = '.spec.configuration.migrations';
const MEMORY_DENSITY_JSONPATH =
  '{.spec.virtualization.higherWorkloadDensity.memoryOvercommitPercentage}';

test.describe.configure({ mode: 'serial' });

test.describe('Cluster General settings', () => {
  test.beforeEach(async ({ page, settingsPage }) => {
    await settingsPage.navigate();
    await page.getByText('Configure features').waitFor({ timeout: 2 * MINUTE });
  });

  test('installed version shows 4.x', async ({ settingsPage }) => {
    await settingsPage.expectInstalledVersion('4');
    await settingsPage.expectUpdateStatus('Up to date');
  });

  test('set live migration limits', async ({ settingsPage }) => {
    await settingsPage.setLiveMigrationLimits('4', '1');
    waitForJsonpath(KUBEVIRT_CR, CNV_NS, `{${MIGRATIONS_PATH}.parallelMigrationsPerCluster}`, '4');
    waitForJsonpath(
      KUBEVIRT_CR,
      CNV_NS,
      `{${MIGRATIONS_PATH}.parallelOutboundMigrationsPerNode}`,
      '1',
    );
  });

  test('set memory density', async ({ settingsPage }) => {
    await settingsPage.enableMemoryDensity();
    await settingsPage.setMemoryDensityValue(MEMORY_DENSITY_VALUE);
    waitForJsonpath(HCO_CR, CNV_NS, MEMORY_DENSITY_JSONPATH, MEMORY_DENSITY_VALUE);
  });

  test('disable memory density', async ({ settingsPage }) => {
    await settingsPage.disableMemoryDensity();
    waitForJsonpath(HCO_CR, CNV_NS, MEMORY_DENSITY_JSONPATH, '100');
  });
});
