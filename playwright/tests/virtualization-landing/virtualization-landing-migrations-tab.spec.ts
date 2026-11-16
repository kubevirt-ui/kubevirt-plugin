import { ADMIN_ONLY_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_LANDING_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-landing-fixture';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Overview Migrations tab ${ROUTE_VIRTUALIZATION_LANDING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Virtualization overview Migrations sub-tab loads', async ({
    nav,
    overviewPage,
    testNamespace,
  }) => {
    await nav.goToOverviewMigrations(testNamespace);
    await expect(overviewPage.migrationsHeading()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});
