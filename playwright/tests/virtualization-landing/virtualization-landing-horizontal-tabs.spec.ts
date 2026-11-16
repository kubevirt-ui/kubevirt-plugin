import { T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Overview horizontal tabs read ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${T2_TAG}`, () => {
  test('Overview, Top consumers, and Migrations sub-tabs show content', async ({
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
  });
});
