import { AUTO_LABELS_FEATURE, AUTO_LABELS_TAG, T2_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/settings-fixture';

import {
  CM_USER_SETTINGS,
  navigateToUserLabelsSection,
  patchAutoLabels,
} from './auto-labels-helpers';

const SUITE = 'Auto-Applied Labels — User';

test.describe('User default VM labels settings', { tag: [T2_TAG, AUTO_LABELS_TAG] }, () => {
  test('Shows empty message when no admin labels are configured', async ({
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
      await navigateToUserLabelsSection(settingsPage);
      const emptyText = settingsPage.page.locator(
        'text=No auto-applied labels have been configured by an administrator',
      );
      await expect(emptyText).toBeVisible();
    } finally {
      await patchAutoLabels(apiClient, utils, []);
    }
  });

  test('User sees admin-configured labels listed with correct keys', async ({
    apiClient,
    settingsPage,
    utils,
  }) => {
    utils.withAllure({
      suite: SUITE,
      feature: AUTO_LABELS_FEATURE,
      tags: [T2_TAG, AUTO_LABELS_TAG],
    });
    await patchAutoLabels(apiClient, utils, [
      { key: 'team', value: 'backend', required: false },
      { key: 'env', value: '', required: true },
    ]);

    try {
      await navigateToUserLabelsSection(settingsPage);
      const section = settingsPage.page.locator('#default-vm-labels--content');
      await expect(section.locator('text=team')).toBeVisible();
      await expect(section.locator('text=env')).toBeVisible();
    } finally {
      await patchAutoLabels(apiClient, utils, []);
    }
  });

  test('User can edit value for a key where admin left value empty', async ({
    apiClient,
    settingsPage,
    utils,
  }) => {
    utils.withAllure({
      suite: SUITE,
      feature: AUTO_LABELS_FEATURE,
      tags: [T2_TAG, AUTO_LABELS_TAG],
    });
    await patchAutoLabels(apiClient, utils, [{ key: 'env', value: '', required: true }]);

    try {
      await navigateToUserLabelsSection(settingsPage);
      const section = settingsPage.page.locator('#default-vm-labels--content');
      const row = section.locator('.pf-v6-l-grid').filter({ hasText: 'env' });
      const valueCell = row.locator('.pf-v6-l-grid__item').nth(1);

      await expect(valueCell.locator('button[aria-label="Edit"]')).toBeVisible();
      await valueCell.locator('button[aria-label="Edit"]').click();
      await valueCell.locator('input').fill('staging');
      await valueCell.locator('button[aria-label="Confirm"]').click();
      await settingsPage.page.waitForTimeout(2000);

      await expect(section.locator('text=staging')).toBeVisible();
    } finally {
      await patchAutoLabels(apiClient, utils, []);
    }
  });

  test('User cannot edit value for a key where admin set a value', async ({
    apiClient,
    settingsPage,
    utils,
  }) => {
    utils.withAllure({
      suite: SUITE,
      feature: AUTO_LABELS_FEATURE,
      tags: [T2_TAG, AUTO_LABELS_TAG],
    });
    await patchAutoLabels(apiClient, utils, [{ key: 'team', value: 'backend', required: false }]);

    try {
      await navigateToUserLabelsSection(settingsPage);
      const section = settingsPage.page.locator('#default-vm-labels--content');
      const row = section.locator('.pf-v6-l-grid').filter({ hasText: 'team' });
      const valueCell = row.locator('.pf-v6-l-grid__item').nth(1);
      const editButton = valueCell.locator('button[aria-label="Edit"]');
      await expect(
        editButton,
        'Edit button should not be visible for admin-set value',
      ).not.toBeVisible({ timeout: 2000 });
    } finally {
      await patchAutoLabels(apiClient, utils, []);
    }
  });

  test('Edited user value persists to user-settings ConfigMap', async ({
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
      await navigateToUserLabelsSection(settingsPage);
      const section = settingsPage.page.locator('#default-vm-labels--content');
      const row = section.locator('.pf-v6-l-grid').filter({ hasText: 'env' });
      const valueCell = row.locator('.pf-v6-l-grid__item').nth(1);

      await valueCell.locator('button[aria-label="Edit"]').click();
      await valueCell.locator('input').fill('production');
      await valueCell.locator('button[aria-label="Confirm"]').click();
      await settingsPage.page.waitForTimeout(2000);

      await expect(async () => {
        const cm = await apiClient.getConfigMap(CM_USER_SETTINGS, utils.EnvVariables.cnvNamespace);
        const cmData = cm?.data as Record<string, string> | undefined;
        const userData = JSON.parse(cmData?.['kube-admin'] || cmData?.['kubeadmin'] || '{}');
        expect(userData?.defaultVMLabels?.env).toBe('production');
      }).toPass({ intervals: [1_000, 2_000, 3_000], timeout: 15_000 });
    } finally {
      await patchAutoLabels(apiClient, utils, []);
    }
  });
});
