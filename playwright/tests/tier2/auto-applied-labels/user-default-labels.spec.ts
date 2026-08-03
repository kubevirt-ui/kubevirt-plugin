/**
 * User Default VM Labels — Settings
 *
 * Tests the User Settings tab for default VM labels. Tests are chained
 * so that tests sharing the same ConfigMap state avoid redundant writes.
 * Only 3 ConfigMap writes total for the entire suite.
 */

import { AUTO_LABELS_FEATURE, AUTO_LABELS_TAG, T2_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/settings-fixture';
import {
  getUserSettingsLabelValue,
  navigateToUserLabelsSection,
  setAutoAppliedLabels,
} from '@/utils/auto-labels-test-helpers';

const SUITE = 'Auto-Applied Labels — User';

test.describe('User default VM labels settings', { tag: [T2_TAG, AUTO_LABELS_TAG] }, () => {
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async ({ apiClient, utils }) => {
    await setAutoAppliedLabels(apiClient, utils, []);
  });

  test.beforeEach(async ({ utils }) => {
    utils.withAllure({
      suite: SUITE,
      feature: AUTO_LABELS_FEATURE,
      tags: [T2_TAG, AUTO_LABELS_TAG],
    });
  });

  // --- Group A: empty ConfigMap ---

  // Shows informational message when no labels configured
  test('Shows empty message when no admin labels configured', async ({
    apiClient,
    autoLabelsComponent,
    settingsPage,
    utils,
  }) => {
    await setAutoAppliedLabels(apiClient, utils, []);
    await navigateToUserLabelsSection(settingsPage);
    await expect(autoLabelsComponent.getEmptyStateLocator('user')).toBeVisible();
  });

  // --- Group B: labels with mixed values (shared for 3 tests) ---

  // All admin-configured keys appear in the user section
  test('Displays admin-configured label keys', async ({
    apiClient,
    autoLabelsComponent,
    settingsPage,
    utils,
  }) => {
    await setAutoAppliedLabels(apiClient, utils, [
      { key: 'team', value: 'backend', required: false },
      { key: 'env', value: '', required: true },
    ]);
    await navigateToUserLabelsSection(settingsPage);
    await expect(autoLabelsComponent.getTextLocatorInSection('team', 'user')).toBeVisible();
  });

  // Edit button hidden for labels with admin-set values (same ConfigMap state)
  test('Cannot edit value where admin set a value', async ({
    autoLabelsComponent,
    settingsPage,
  }) => {
    await navigateToUserLabelsSection(settingsPage);
    await expect(autoLabelsComponent.getEditButtonLocator('team', 'user')).not.toBeVisible();
  });

  // User can edit value where admin left empty (same ConfigMap state)
  test('Can edit value where admin left value empty', async ({
    autoLabelsComponent,
    settingsPage,
  }) => {
    await navigateToUserLabelsSection(settingsPage);
    await autoLabelsComponent.editLabelValue('env', 'staging', 'user');
    await expect(settingsPage.page.locator('#default-vm-labels--content')).toContainText('staging');
  });

  // --- Group C: persist check (fresh state for isolation) ---

  // User-edited value persists to kubevirt-user-settings ConfigMap
  test('User-edited value persists to user-settings ConfigMap', async ({
    apiClient,
    autoLabelsComponent,
    settingsPage,
    utils,
  }) => {
    await setAutoAppliedLabels(apiClient, utils, [{ key: 'env', value: '', required: false }]);
    await navigateToUserLabelsSection(settingsPage);
    await autoLabelsComponent.editLabelValue('env', 'production', 'user');

    await expect(async () => {
      const value = await getUserSettingsLabelValue(apiClient, utils, 'env');
      expect(value).toBe('production');
    }).toPass({ intervals: [2000], timeout: 15000 });
  });
});
