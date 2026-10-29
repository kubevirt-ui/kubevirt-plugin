import { ADMIN_ONLY_TAG, GATING_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_SETTINGS_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import {
  AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED,
  KUBEVIRT_UI_FEATURES_NAMESPACE,
} from '@/utils/kubevirt-ui-features';
import { TestTimeouts } from '@/utils/test-config';

/**
 * Standalone `/virtualization-settings` may 404 on 4.13; settings are exercised via Overview → Settings.
 * (Overview Settings visibility is also covered in `virtualization-landing.spec.ts` gating.)
 */
test.describe(`Preview features Enable CPU limit ${ROUTE_VIRTUALIZATION_SETTINGS_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Enable CPU limit preview switch can be turned on and off', async ({
    apiClient,
    nav,
    overviewPage,
  }) => {
    const feature = AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED;
    const featuresNs = KUBEVIRT_UI_FEATURES_NAMESPACE;
    const initial = (await apiClient.getKubevirtUiFeature(feature, featuresNs)) ?? 'false';

    try {
      await apiClient.patchKubevirtUiFeature(feature, 'false', featuresNs);
      await nav.goToOverview();
      await overviewPage.openSubTab('horizontal-link-Settings');
      await overviewPage.openSettingsPreviewFeaturesTab();
      await expect(overviewPage.cpuLimitPreviewSwitch()).not.toBeChecked();

      await overviewPage.setCpuLimitPreviewSwitch(true);
      await expect
        .poll(() => apiClient.getKubevirtUiFeature(feature, featuresNs), {
          message: 'kubevirt-ui-features should enable CPU limit preview',
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe('true');
      await expect(overviewPage.cpuLimitPreviewSwitch()).toBeChecked();

      await overviewPage.setCpuLimitPreviewSwitch(false);
      await expect
        .poll(() => apiClient.getKubevirtUiFeature(feature, featuresNs), {
          message: 'kubevirt-ui-features should disable CPU limit preview',
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe('false');
      await expect(overviewPage.cpuLimitPreviewSwitch()).not.toBeChecked();
    } finally {
      await apiClient.patchKubevirtUiFeature(feature, initial, featuresNs);
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
