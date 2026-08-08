import {
  ADMIN_ONLY_TAG,
  AUTO_LABELS_FEATURE,
  AUTO_LABELS_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/settings-fixture';

import {
  expandAutoLabelsSection,
  getAutoLabelsFromConfigMap,
  patchAutoLabels,
} from './auto-labels-helpers';

const SUITE = 'Auto-Applied Labels — Admin CRUD';

test.describe(
  'Admin auto-applied labels — CRUD operations',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, AUTO_LABELS_TAG] },
  () => {
    test('Section shows empty state when no labels configured', async ({
      apiClient,
      settingsPage,
      utils,
    }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });
      await patchAutoLabels(apiClient, utils, []);

      try {
        await expandAutoLabelsSection(settingsPage);
        await expect(
          settingsPage.page.locator('text=No auto-applied labels configured'),
        ).toBeVisible();
      } finally {
        await patchAutoLabels(apiClient, utils, []);
      }
    });

    test('Adding a new label key persists to ConfigMap', async ({
      apiClient,
      settingsPage,
      utils,
    }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });
      await patchAutoLabels(apiClient, utils, []);

      try {
        await expandAutoLabelsSection(settingsPage);
        await settingsPage.page.locator('button:has-text("Add new key")').click();
        const lastRow = settingsPage.page
          .locator('#auto-applied-labels--content .pf-v6-l-grid')
          .last();
        await lastRow.locator('input').first().fill('app.kubernetes.io/team');
        await lastRow.locator('button[aria-label="Confirm"]').click();
        await settingsPage.page.waitForTimeout(2000);

        await expect(async () => {
          const labels = await getAutoLabelsFromConfigMap(apiClient, utils);
          expect(labels).toHaveLength(1);
          expect(labels[0]).toHaveProperty('key', 'app.kubernetes.io/team');
        }).toPass({ intervals: [1_000, 2_000, 3_000], timeout: 15_000 });
      } finally {
        await patchAutoLabels(apiClient, utils, []);
      }
    });

    test('Setting a value for a label persists to ConfigMap', async ({
      apiClient,
      settingsPage,
      utils,
    }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });
      await patchAutoLabels(apiClient, utils, [{ key: 'env', value: '', required: false }]);

      try {
        await expandAutoLabelsSection(settingsPage);
        const row = settingsPage.page
          .locator('#auto-applied-labels--content .pf-v6-l-grid')
          .filter({ hasText: 'env' });
        const valueCell = row.locator('.pf-v6-l-grid__item').nth(1);
        await valueCell.locator('button[aria-label="Edit"]').click();
        await valueCell.locator('input').fill('production');
        await valueCell.locator('button[aria-label="Confirm"]').click();
        await settingsPage.page.waitForTimeout(2000);

        await expect(async () => {
          const labels = await getAutoLabelsFromConfigMap(apiClient, utils);
          expect(labels[0]).toHaveProperty('value', 'production');
        }).toPass({ intervals: [1_000, 2_000, 3_000], timeout: 15_000 });
      } finally {
        await patchAutoLabels(apiClient, utils, []);
      }
    });

    test('Toggling Required switch persists to ConfigMap', async ({
      apiClient,
      settingsPage,
      utils,
    }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });
      await patchAutoLabels(apiClient, utils, [{ key: 'env', value: 'dev', required: false }]);

      try {
        await expandAutoLabelsSection(settingsPage);
        const row = settingsPage.page
          .locator('#auto-applied-labels--content .pf-v6-l-grid')
          .filter({ hasText: 'env' });
        await row.locator('.pf-v6-c-switch').click();
        await settingsPage.page.waitForTimeout(2000);

        await expect(async () => {
          const labels = await getAutoLabelsFromConfigMap(apiClient, utils);
          expect(labels[0]).toHaveProperty('required', true);
        }).toPass({ intervals: [1_000, 2_000, 3_000], timeout: 15_000 });
      } finally {
        await patchAutoLabels(apiClient, utils, []);
      }
    });

    test('Deleting a label removes it from ConfigMap', async ({
      apiClient,
      settingsPage,
      utils,
    }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });
      await patchAutoLabels(apiClient, utils, [{ key: 'env', value: 'dev', required: false }]);

      try {
        await expandAutoLabelsSection(settingsPage);
        const row = settingsPage.page
          .locator('#auto-applied-labels--content .pf-v6-l-grid')
          .filter({ hasText: 'env' });
        await row.locator('button[aria-label="Remove"]').click();
        await settingsPage.page.waitForTimeout(2000);

        await expect(async () => {
          const labels = await getAutoLabelsFromConfigMap(apiClient, utils);
          expect(labels).toHaveLength(0);
        }).toPass({ intervals: [1_000, 2_000, 3_000], timeout: 15_000 });
      } finally {
        await patchAutoLabels(apiClient, utils, []);
      }
    });
  },
);
