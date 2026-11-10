import { GATING_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Overview read ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-7924) Overview dashboard and sub-nav tabs are visible', async ({
    nav,
    overviewPage,
    testNamespace,
  }) => {
    await nav.goToVirtualMachines();
    await expect(overviewPage.page.getByRole('tab', { name: /^Overview$/i })).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await expect(overviewPage.page.getByRole('tab', { name: /^Virtual machines$/i })).toBeVisible();
    await nav.goToOverviewSettings();
    await expect(overviewPage.settingsClusterTab()).toBeVisible();
    await expect(overviewPage.settingsUserTab()).toBeVisible();
    await nav.goToOverviewMigrations(testNamespace);
    await expect(overviewPage.migrationsHeading()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });
});
