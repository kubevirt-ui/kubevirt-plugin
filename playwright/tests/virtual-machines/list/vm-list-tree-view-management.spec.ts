import { ADMIN_ONLY_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-list-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VirtualMachines tree view management ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('API-created VM appears in all-namespaces tree', async ({
    apiClient,
    testNamespace,
    vmListPage,
  }) => {
    const name = CRUD_NAMES.vmExample;
    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await expect
        .poll(() => apiClient.virtualMachineExists(name, testNamespace), {
          timeout: TestTimeouts.VM_CREATION,
        })
        .toBe(true);

      await vmListPage.goToAllNamespacesList();
      await vmListPage.searchTreeView(name);
      await vmListPage.waitForTreeItemVisible(vmListPage.vmTreeItemId(testNamespace, name));
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });

  test('Delete API-created VM from tree context menu', async ({
    apiClient,
    testNamespace,
    vmListPage,
  }) => {
    const name = generateRandomVmName('tree-del').slice(0, 50);

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyMigratableVirtualMachine(testNamespace, name);
    await expect
      .poll(() => apiClient.virtualMachineExists(name, testNamespace), {
        timeout: TestTimeouts.VM_CREATION,
      })
      .toBe(true);

    try {
      await vmListPage.deleteVirtualMachineFromTreeContext(testNamespace, name);
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace).catch(() => undefined);
    }

    await expect
      .poll(() => apiClient.virtualMachineExists(name, testNamespace), {
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
  });
});
