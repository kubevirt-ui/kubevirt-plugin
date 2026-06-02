import { expect } from '@playwright/test';

import { test } from '../../fixtures';
import { NAV_TIMEOUT } from '../../utils/constants';

/**
 * "Create template" dropdown — verify each option triggers the expected action.
 */
test.describe('Create template button', () => {
  test.beforeEach(async ({ templatesPage }) => {
    await templatesPage.navigate();
    await templatesPage.waitForListLoaded();
  });

  test('"From an existing template" opens Clone modal', async ({ page, templatesPage }) => {
    await templatesPage.selectCreateOption('From an existing template');
    await templatesPage.expectCloneModalVisible();

    await expect(page.getByText('Source template project')).toBeVisible();
    await expect(templatesPage.saveButton).toBeDisabled();

    await templatesPage.closeCloneModal();
  });

  test('"From a virtual machine" navigates to VMs page', async ({ page, templatesPage }) => {
    await templatesPage.selectCreateOption('From a virtual machine');

    await expect(page).toHaveURL(/VirtualMachine/, { timeout: NAV_TIMEOUT });
    await expect(page).toHaveURL(/tab=vms/);
    // TODO: enable once the test cluster Console version supports toast notifications
    // await expect(page.getByText('To create a template from a VM', { exact: false })).toBeVisible();
  });

  test('"With YAML" opens YAML editor', async ({ templatesPage }) => {
    await templatesPage.selectCreateOption('With YAML');
    await templatesPage.expectCreateYAMLPageLoaded();
  });
});
