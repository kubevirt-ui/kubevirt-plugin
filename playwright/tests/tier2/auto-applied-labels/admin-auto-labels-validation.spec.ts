import {
  ADMIN_ONLY_TAG,
  AUTO_LABELS_FEATURE,
  AUTO_LABELS_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/settings-fixture';

import { expandAutoLabelsSection, patchAutoLabels } from './auto-labels-helpers';

const SUITE = 'Auto-Applied Labels — Admin Validation';

test.describe(
  'Admin auto-applied labels — validation',
  { tag: [T2_TAG, ADMIN_ONLY_TAG, AUTO_LABELS_TAG] },
  () => {
    test('Key validation rejects duplicate keys', async ({ apiClient, settingsPage, utils }) => {
      utils.withAllure({
        suite: SUITE,
        feature: AUTO_LABELS_FEATURE,
        tags: [T2_TAG, AUTO_LABELS_TAG],
      });
      await patchAutoLabels(apiClient, utils, [{ key: 'env', value: '', required: false }]);

      try {
        await expandAutoLabelsSection(settingsPage);
        await settingsPage.page.locator('button:has-text("Add new key")').click();

        const lastRow = settingsPage.page
          .locator('#auto-applied-labels--content .pf-v6-l-grid')
          .last();
        await lastRow.locator('input').first().fill('env');
        await lastRow.locator('input').first().press('Tab');

        await expect(
          settingsPage.page.locator('.pf-v6-c-helper-text__item--error').first(),
        ).toBeVisible();
      } finally {
        await patchAutoLabels(apiClient, utils, []);
      }
    });

    test('Key validation rejects invalid Kubernetes label key format', async ({
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
        await lastRow.locator('input').first().fill('Invalid Key With Spaces');
        await lastRow.locator('input').first().press('Tab');

        await expect(
          settingsPage.page.locator('.pf-v6-c-helper-text__item--error').first(),
        ).toBeVisible();
      } finally {
        await patchAutoLabels(apiClient, utils, []);
      }
    });

    test('Value validation rejects values over 63 characters', async ({
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
        await valueCell.locator('input').fill('a'.repeat(64));
        await valueCell.locator('input').press('Tab');

        await expect(
          settingsPage.page.locator('.pf-v6-c-helper-text__item--error').first(),
        ).toBeVisible();
      } finally {
        await patchAutoLabels(apiClient, utils, []);
      }
    });
  },
);
