import { GATING_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Overview sub-tabs read ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('Each overview horizontal sub-tab shows readable content', async ({
    nav,
    overviewPage,
    testNamespace,
  }) => {
    await nav.goToVirtualMachines();
    await overviewPage.page.getByRole('tab', { name: /^Overview$/i }).click();
    await expect(
      overviewPage.page.getByText(/Virtual machine statuses|No virtual machines yet/i).first(),
    ).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await nav.goToOverviewMigrations(testNamespace);
    await expect(overviewPage.migrationsHeading()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await nav.goToOverviewSettings();
    await overviewPage.openSettingsClusterTab();
    await expect(overviewPage.clusterSettingsContent()).toBeVisible();
    await overviewPage.openSettingsUserTab();
    await expect(overviewPage.userSettingsContent()).toBeVisible();
  });
});
