import {
  ADMIN_ONLY_TAG,
  NETWORKING_TAG_LABEL,
  T1,
  T1_TAG,
  VM_TABS_TAG,
} from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';
import { generateRandomName } from '@/utils/random-data-generator';
import {
  createBridgeNetworkAttachmentDefinition,
  createVmWithEmptyDisk,
  setupTestNamespace,
} from '@/utils/test-setup-helpers';

const SUITE = 'VM Network Interface Name';
const EXISTING_NIC_NAME = 'default';

test.describe(
  'Tier1 VM network interface name validation',
  { tag: [T1_TAG, ADMIN_ONLY_TAG] },
  () => {
    test('validates blank and duplicate names when adding a NIC, then enables name editing', async ({
      apiClient,
      vmDetailPage,
      vmListPage,
      utils,
    }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, VM_TABS_TAG, NETWORKING_TAG_LABEL, ADMIN_ONLY_TAG],
      });

      const namespace = await setupTestNamespace(apiClient, 'nic-name');
      const vmName = utils.generateRandomVmName('nic-name');
      const nadName = utils.generateRandomNadName('nic-name');
      await createBridgeNetworkAttachmentDefinition(apiClient, nadName, namespace);
      await createVmWithEmptyDisk(apiClient, vmName, namespace, false);

      await vmListPage.navigateToVmViaTreeView(namespace, vmName);
      await vmDetailPage.openAddNetworkInterfaceModal();

      await vmDetailPage.waitForNetworkInterfaceAutoSelection();
      await vmDetailPage.expandNetworkInterfaceAdvancedSettings();

      const modal = vmDetailPage.page.locator('[role="dialog"]');
      const nameInput = modal.locator('#name');
      const requiredError = modal.getByText('This field is required');
      const duplicateError = modal.getByText(
        'This name is already used by another network interface',
      );

      await test.step('Show the required-name error', async () => {
        await nameInput.clear();
        await expect(requiredError).toBeVisible();
      });

      await test.step('Show the duplicate-name error', async () => {
        await nameInput.fill(EXISTING_NIC_NAME);
        await expect(duplicateError).toBeVisible();
      });

      const nicName = generateRandomName('nic');
      await test.step('Create a NIC with a unique name', async () => {
        await nameInput.fill(nicName);
        await expect(requiredError).toBeHidden();
        await expect(duplicateError).toBeHidden();
        await vmDetailPage.clickDialogSaveButton();
        await expect(modal).toBeHidden({ timeout: utils.TestTimeouts.UI_ACTION_COMPLETE });
        await expect
          .poll(() => vmDetailPage.getConfigurationNetworkNicName(nicName), {
            message: `NIC ${nicName} should appear after creation`,
            timeout: utils.TestTimeouts.UI_ACTION_COMPLETE,
          })
          .not.toBe('');
      });

      await test.step('Edit network interface exposes an enabled, valid name field', async () => {
        await vmDetailPage.openEditNetworkInterfaceModal(nicName);
        await vmDetailPage.expandNetworkInterfaceAdvancedSettings();

        await expect(nameInput).toBeEnabled();
        await expect(requiredError).toBeHidden();
        await expect(duplicateError).toBeHidden();
      });
    });
  },
);
