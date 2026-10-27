import { T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-list-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { generateRandomLabel, generateRandomVmName } from '@/utils/random-data-generator';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

test.describe(`VirtualMachines UI update and delete ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${T1_TAG}`, () => {
  test('Update VirtualMachine labels in UI', async ({ apiClient, testNamespace, vmDetailPage }) => {
    const name = CRUD_NAMES.vmExample;
    const label = generateRandomLabel('e2e');

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetailPage.openVmAndWaitForDetail(testNamespace, name);
      await vmDetailPage.editLabels(name, label);
      const [labelKey, ...labelValueParts] = label.split('=');
      const labelValue = labelValueParts.join('=');
      await expect
        .poll(
          async () => {
            const vm = await apiClient.getVirtualMachine(testNamespace, name);
            return vm?.metadata?.labels?.[labelKey] === labelValue;
          },
          {
            message: `VirtualMachine ${name} should have label ${label}`,
            timeout: TestTimeouts.LONG_OPERATION,
          },
        )
        .toBe(true);
      await vmDetailPage.navigateToMetadataTab();
      await expect(vmDetailPage.metadataLabelValue(label)).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });

  test('Delete VirtualMachine from list in UI', async ({
    apiClient,
    testNamespace,
    vmListPage,
  }) => {
    const name = generateRandomVmName('vm-del').slice(0, 50);

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyMigratableVirtualMachine(testNamespace, name);
    await expect
      .poll(() => apiClient.virtualMachineExists(name, testNamespace), {
        message: `VirtualMachine ${testNamespace}/${name} should exist`,
        timeout: TestTimeouts.VM_CREATION,
      })
      .toBe(true);

    await vmListPage.goToNamespaceList(testNamespace);
    await vmListPage.waitForVmRowInList(name, testNamespace, 2 * MINUTE);
    await vmListPage.openDeleteDialog(name, testNamespace);
    await expect(vmListPage.deleteDialogHeading('VirtualMachine')).toBeVisible();
    await vmListPage.confirmDelete(name);
    await expect
      .poll(() => apiClient.virtualMachineExists(name, testNamespace), {
        message: `VirtualMachine ${testNamespace}/${name} should be deleted`,
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
    await vmListPage.waitForVmAbsentFromList(name, testNamespace, TestTimeouts.LONG_OPERATION);
  });
});
