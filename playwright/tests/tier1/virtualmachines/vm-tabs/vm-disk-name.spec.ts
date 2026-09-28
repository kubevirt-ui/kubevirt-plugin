import { DISK_NAMES } from '@/data-models';
import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';
import { createVmWithEmptyDisk, setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Disk Name';

test.describe('Tier1 VM disk name validation', { tag: [T1_TAG, '@nonpriv'] }, () => {
  test('validates blank and duplicate names when adding a disk, then enables name editing', async ({
    apiClient,
    vmDetailPage,
    vmListPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, VM_TABS_TAG] });

    const namespace = await setupTestNamespace(apiClient, 'disk-name');
    const vmName = utils.generateRandomVmName('disk-name');
    await createVmWithEmptyDisk(apiClient, vmName, namespace, false);

    await vmListPage.navigateToVmViaTreeView(namespace, vmName);
    await vmDetailPage.openAddBlankDiskModal();
    await vmDetailPage.expandDiskAdvancedSettings();

    const modal = vmDetailPage.page.locator('[role="dialog"]');
    const nameInput = modal.locator('#name');
    const requiredError = modal.getByText('This field is required');
    const duplicateError = modal.getByText('This name is already used by another disk');

    await test.step('Show the required-name error', async () => {
      await nameInput.clear();
      await expect(requiredError).toBeVisible();
    });

    await test.step('Show the duplicate-name error', async () => {
      await nameInput.fill(DISK_NAMES.EMPTY);
      await expect(duplicateError).toBeVisible();
    });

    const diskName = utils.generateRandomDiskName('name');
    await test.step('Create a disk with a unique name', async () => {
      await nameInput.fill(diskName);
      await expect(requiredError).toBeHidden();
      await expect(duplicateError).toBeHidden();
      await vmDetailPage.clickDialogSaveButton();
      await expect(modal).toBeHidden({ timeout: utils.TestTimeouts.UI_ACTION_COMPLETE });
      await expect
        .poll(() => vmDetailPage.verifyDiskNameExists(diskName), {
          message: `Disk ${diskName} should appear after creation`,
          timeout: utils.TestTimeouts.VM_CREATION,
        })
        .toBe(true);
    });

    await test.step('Edit Disk exposes an enabled, valid name field', async () => {
      await vmDetailPage.openEditDiskModal(diskName);
      await vmDetailPage.expandDiskAdvancedSettings();

      await expect(nameInput).toBeEnabled();
      await expect(requiredError).toBeHidden();
      await expect(duplicateError).toBeHidden();
    });
  });
});
