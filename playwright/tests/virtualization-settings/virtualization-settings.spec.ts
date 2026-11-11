import { ADMIN_ONLY_TAG, CNV_SETTINGS_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUALIZATION_SETTINGS_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/virtualization-settings-fixture';
import { TestTimeouts } from '@/utils/test-config';

/** Deep settings coverage (read-only) lives in `virtualization-settings-gating.spec.ts`. */

test.describe(`Virtualization settings smoke ${ROUTE_VIRTUALIZATION_SETTINGS_TAG} ${CNV_SETTINGS_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Cluster settings tab loads configuration shell', async ({ settingsPage }) => {
    await settingsPage.goToSettings();
    await settingsPage.openTab('cluster');
    await expect(
      settingsPage.page
        .getByText(/Installed version|General settings|Virtualization features/i)
        .first(),
    ).toBeVisible({ timeout: TestTimeouts.LONG_OPERATION });
  });

  test('User settings tab loads', async ({ settingsPage }) => {
    await settingsPage.goToSettings();
    await settingsPage.openTab('user');
    await expect(
      settingsPage.page.getByText(/Manage SSH keys|Getting started resources|Permissions/i).first(),
    ).toBeVisible({ timeout: TestTimeouts.LONG_OPERATION });
  });
});
