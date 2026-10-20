import { ADMIN_ONLY_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_SETTINGS_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { TestTimeouts } from '@/utils/test-config';

/**
 * Standalone `/virtualization-settings` may 404 on 4.13; settings are exercised via Overview → Settings.
 * (Overview Settings visibility is also covered in `virtualization-landing.spec.ts` gating.)
 */
test.describe(`Virtualization settings via overview ${ROUTE_VIRTUALIZATION_SETTINGS_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Overview Settings sub-tab shows virtualization configuration', async ({
    overviewPage,
    nav,
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
    overviewPage,
    nav,
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
    overviewPage,
    nav,
  }) => {
    await nav.goToOverview();
    await overviewPage.openSubTab('horizontal-link-Settings');
    await expect(overviewPage.settingsContent()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });
});
