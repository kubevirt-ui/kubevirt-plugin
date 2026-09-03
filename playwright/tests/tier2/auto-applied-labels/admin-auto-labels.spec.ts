/**
 * Admin Auto-Applied Labels — Settings
 *
 * Tests management operations (add, edit, toggle, delete) and validation rules
 * (duplicate key, invalid format, value length) as a progressive flow.
 * The ConfigMap starts empty, each test builds on the previous state.
 * Only one setup and one cleanup call are needed for the entire suite.
 */

import {
  ADMIN_ONLY_TAG,
  AUTO_LABELS_FEATURE,
  AUTO_LABELS_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/settings-fixture';
import {
  expandAdminAutoLabelsSection,
  getAutoLabelsFromConfigMap,
  setAutoAppliedLabels,
} from '@/utils/auto-labels-test-helpers';

const SUITE = 'Auto-Applied Labels — Admin Settings';

test.describe(
  'Admin auto-applied labels',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, AUTO_LABELS_TAG] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async ({ apiClient, utils }) => {
      await setAutoAppliedLabels(apiClient, utils, []);
    });

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

    // ConfigMap: [] — verify empty state renders
    test('Shows empty state when no labels exist', async ({
      autoLabelsComponent,
      settingsPage,
    }) => {
      await expandAdminAutoLabelsSection(settingsPage);
      await expect(autoLabelsComponent.getEmptyStateLocator('admin')).toBeVisible();
    });

    // ConfigMap: [] — invalid key format triggers validation (no state change)
    test('Invalid key format shows validation error', async ({
      autoLabelsComponent,
      settingsPage,
    }) => {
      await expandAdminAutoLabelsSection(settingsPage);
      await autoLabelsComponent.clickAddNewKey();
      await autoLabelsComponent.fillNewKeyInput('Invalid Key With Spaces');
      await autoLabelsComponent.pressTabInLastRow();
      await expect(autoLabelsComponent.getValidationErrorLocator()).toBeVisible();
    });

    // ConfigMap: [] → [{key: 'env'}] — add a label via UI
    test('Admin adds a label key and it persists to ConfigMap', async ({
      apiClient,
      autoLabelsComponent,
      settingsPage,
      utils,
    }) => {
      await expandAdminAutoLabelsSection(settingsPage);
      await autoLabelsComponent.clickAddNewKey();
      await autoLabelsComponent.fillNewKeyInput('env');
      await autoLabelsComponent.confirmEditInLastRow();

      await expect(async () => {
        const labels = await getAutoLabelsFromConfigMap(apiClient, utils);
        expect(labels).toHaveLength(1);
        expect(labels[0]).toHaveProperty('key', 'env');
      }).toPass({ intervals: [2000], timeout: 15000 });
    });

    // ConfigMap: [{key: 'env'}] — duplicate key triggers validation
    test('Duplicate key shows validation error', async ({ autoLabelsComponent, settingsPage }) => {
      await expandAdminAutoLabelsSection(settingsPage);
      await autoLabelsComponent.clickAddNewKey();
      await autoLabelsComponent.fillNewKeyInput('env');
      await autoLabelsComponent.pressTabInLastRow();
      await expect(autoLabelsComponent.getValidationErrorLocator()).toBeVisible();
    });

    // ConfigMap: [{key: 'env', value: ''}] → [{key: 'env', value: 'production'}]
    test('Admin edits label value and it persists', async ({
      apiClient,
      autoLabelsComponent,
      settingsPage,
      utils,
    }) => {
      await expandAdminAutoLabelsSection(settingsPage);
      await autoLabelsComponent.editLabelValue('env', 'production');

      await expect(async () => {
        const labels = await getAutoLabelsFromConfigMap(apiClient, utils);
        expect((labels[0] as { value: string })?.value).toBe('production');
      }).toPass({ intervals: [2000], timeout: 15000 });
    });

    // ConfigMap: [{key: 'env', value: 'production'}] — value >63 chars triggers validation
    test('Value over 63 characters shows validation error', async ({
      autoLabelsComponent,
      settingsPage,
    }) => {
      await expandAdminAutoLabelsSection(settingsPage);
      await autoLabelsComponent.triggerValueValidation('env', 'a'.repeat(64));
      await expect(autoLabelsComponent.getValidationErrorLocator()).toBeVisible();
    });

    // ConfigMap: [{key: 'env', value: 'production', required: false}] → required: true
    test('Admin toggles Required and it persists', async ({
      apiClient,
      autoLabelsComponent,
      settingsPage,
      utils,
    }) => {
      await expandAdminAutoLabelsSection(settingsPage);
      await autoLabelsComponent.toggleRequired('env');

      await expect(async () => {
        const labels = await getAutoLabelsFromConfigMap(apiClient, utils);
        expect((labels[0] as { required: boolean })?.required).toBe(true);
      }).toPass({ intervals: [2000], timeout: 15000 });
    });

    // ConfigMap: [{key: 'env', ...}] → [] — delete returns to empty
    test('Admin deletes a label and ConfigMap is empty', async ({
      apiClient,
      autoLabelsComponent,
      settingsPage,
      utils,
    }) => {
      await expandAdminAutoLabelsSection(settingsPage);
      await autoLabelsComponent.clickRemoveLabel('env');

      await expect(async () => {
        const labels = await getAutoLabelsFromConfigMap(apiClient, utils);
        expect(labels).toHaveLength(0);
      }).toPass({ intervals: [2000], timeout: 15000 });
    });
  },
);
