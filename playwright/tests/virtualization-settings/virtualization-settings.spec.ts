import { ADMIN_ONLY_TAG, GATING_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_SETTINGS_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { TestTimeouts } from '@/utils/test-config';

/**
 * Settings live at `/k8s/all-namespaces/virtualization-overview/settings` (4.18+).
 * Auto-compute CPU/memory limits is under Cluster → Resource management (HCO feature gate).
 */
test.describe(`Cluster settings auto-compute CPU limits ${ROUTE_VIRTUALIZATION_SETTINGS_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Auto-compute CPU and memory limits switch can be turned on and off', async ({
    apiClient,
    nav,
    overviewPage,
  }) => {
    const initial = await apiClient.getHyperConvergedAutoResourceLimits();

    try {
      await apiClient.patchHyperConvergedAutoResourceLimits(false);
      await nav.goToOverviewSettings();
      await overviewPage.openResourceManagementSection();
      await expect(overviewPage.autoComputeCpuLimitsSwitch()).not.toBeChecked();

      await overviewPage.setAutoComputeCpuLimitsSwitch(true);
      await expect
        .poll(() => apiClient.getHyperConvergedAutoResourceLimits(), {
          message: 'HCO featureGates.autoResourceLimits should be enabled',
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe(true);
      await expect(overviewPage.autoComputeCpuLimitsSwitch()).toBeChecked();

      await overviewPage.setAutoComputeCpuLimitsSwitch(false);
      await expect
        .poll(() => apiClient.getHyperConvergedAutoResourceLimits(), {
          message: 'HCO featureGates.autoResourceLimits should be disabled',
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe(false);
      await expect(overviewPage.autoComputeCpuLimitsSwitch()).not.toBeChecked();
    } finally {
      if (initial !== undefined) {
        await apiClient.patchHyperConvergedAutoResourceLimits(initial);
      }
    }
  });
});

test.describe(`Virtualization settings via overview ${ROUTE_VIRTUALIZATION_SETTINGS_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Overview Settings sub-tab shows virtualization configuration', async ({
    nav,
    overviewPage,
  }) => {
    await nav.goToOverview();
    await overviewPage.openSubTab('horizontal-link-Settings');
    await expect(overviewPage.settingsContent()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });
});

test.describe(`Virtualization preview features ${ROUTE_VIRTUALIZATION_SETTINGS_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Overview Settings sub-tab remains readable for cluster admin', async ({
    nav,
    overviewPage,
  }) => {
    await nav.goToOverview();
    await overviewPage.openSubTab('horizontal-link-Settings');
    await expect(overviewPage.settingsContent()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });
});

test.describe(`Virtualization settings recommended capabilities ${ROUTE_VIRTUALIZATION_SETTINGS_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Overview Settings sub-tab shows HCO or general configuration', async ({
    nav,
    overviewPage,
  }) => {
    await nav.goToOverview();
    await overviewPage.openSubTab('horizontal-link-Settings');
    await expect(overviewPage.settingsContent()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });
});
