import { ADMIN_ONLY_TAG, GATING_TAG, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_CHECKUPS_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/checkups-fixture';
import { generateRandomCheckupName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Checkups gating page load ${ROUTE_CHECKUPS_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Checkups page shows Storage and Self validation tabs with storage affordance', async ({
    checkupsPage,
    nav,
    testNamespace,
  }) => {
    await nav.goToCheckups(testNamespace);

    await expect(checkupsPage.page.getByRole('tab', { name: /^Storage$/i })).toBeVisible();
    await expect(checkupsPage.page.getByRole('tab', { name: /Self validation/i })).toBeVisible();

    await checkupsPage.clickStorageTab();
    await checkupsPage.waitForStorageAffordance();
  });
});

test.describe(`Storage checkup form ${ROUTE_CHECKUPS_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Storage checkup form loads and accepts name and timeout', async ({
    checkupsPage,
    testNamespace,
  }) => {
    // Manageable Tier1 scope: exercise the form UI without requiring cluster checkup runners.
    await checkupsPage.goToStorageList(testNamespace);
    await checkupsPage.installPermissionsIfNeeded();
    await checkupsPage.goToStorageForm(testNamespace);

    const checkupName = generateRandomCheckupName('storage');
    await checkupsPage.setCheckupName(checkupName);
    await checkupsPage.setStorageTimeoutMinutes('30');

    await expect(
      checkupsPage.page.getByRole('heading', { name: /Run storage checkup/i }),
    ).toBeVisible();
    await expect(
      checkupsPage.page.locator('main').getByRole('button', { name: /^Run$/i }),
    ).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    // Prefer Cancel when present; otherwise navigate back to the Storage list.
    const cancel = checkupsPage.page.getByRole('button', { name: /^Cancel$/i });
    if (await cancel.isVisible().catch(() => false)) {
      await cancel.click();
    } else {
      await checkupsPage.goToStorageList(testNamespace);
    }
    await expect(checkupsPage.page.getByRole('tab', { name: /^Storage$/i })).toBeVisible();
  });
});

test.describe(`Checkups Self validation ${ROUTE_CHECKUPS_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Self validation tab loads on checkups page', async ({
    checkupsPage,
    nav,
    testNamespace,
  }) => {
    // 4.22 replaced Network latency with Self validation — assert the current surface.
    await nav.goToCheckups(testNamespace);
    await expect(checkupsPage.selfValidationTab()).toBeVisible({
      timeout: TestTimeouts.CONSOLE_PAGE_LOAD,
    });
    await checkupsPage.clickSelfValidationTab();
    await expect(checkupsPage.selfValidationTab()).toHaveAttribute('aria-selected', 'true');
    await expect(checkupsPage.page.locator('main')).toBeVisible();
  });
});
