import { ADMIN_ONLY_TAG, NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-list-fixture';
import { CRUD_NAMES, VM_FROM_CATALOG } from '@/utils/constants';
import { verifyVirtualMachineCreated } from '@/utils/creation-verification';
import { virtualMachineImportYaml } from '@/utils/manifests';
import {
  generateNameWithBase,
  generateRandomLabel,
  generateRandomVmName,
} from '@/utils/random-data-generator';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

test.describe(`VirtualMachines CRUD from YAML ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Create VirtualMachine with YAML and delete in UI', async ({
    apiClient,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    const name = generateNameWithBase(CRUD_NAMES.vmExample, 50);

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await expect
      .poll(() => apiClient.virtualMachineExists(name, testNamespace), {
        message: `pre-test cleanup: VirtualMachine ${testNamespace}/${name} should be absent`,
      })
      .toBe(false);

    await vmListPage.goToNamespaceList(testNamespace);
    await vmListPage.createFromYaml(virtualMachineImportYaml({ name, namespace: testNamespace }));
    await expect
      .poll(() => vmListPage.currentUrl())
      .toMatch(vmListPage.virtualMachineDetailUrlPattern(name));
    await expect(vmDetailPage.detailHeading()).toContainText(name, {
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, name);

    await vmListPage.deleteFromDetail(vmDetailPage, name);
    await expect
      .poll(() => apiClient.virtualMachineExists(name, testNamespace), {
        message: `VirtualMachine ${testNamespace}/${name} should be deleted`,
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
    await vmListPage.goToNamespaceList(testNamespace);
    await vmListPage.filterByName(name);
    await expect(vmListPage.vmRow(name, testNamespace)).toBeHidden({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});

test.describe(`VirtualMachines UI create from catalog ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Create VirtualMachine using Create → From catalog on VM list', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmListPage,
  }) => {
    const vmName = generateRandomVmName('vm-cat').slice(0, 50);

    try {
      await vmListPage.goToCreateFromCatalog(testNamespace);

      await expect
        .poll(() => catalogPage.currentUrl())
        .toMatch(catalogPage.catalogEntryUrlPattern(testNamespace));
      await catalogPage.selectTemplateByMetadataName(VM_FROM_CATALOG.templateMetadataName);
      await catalogPage.quickCreateVm(vmName);

      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

function registerVmListUiUpdateAndDelete(userTag: string): void {
  test.describe(`VirtualMachines UI update and delete ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${T1_TAG} ${userTag}`, () => {
    test('Update VirtualMachine labels in UI', async ({
      apiClient,
      testNamespace,
      vmDetailPage,
    }) => {
      const name = CRUD_NAMES.vmExample;
      const label = generateRandomLabel('e2e');

      await apiClient.deleteVirtualMachine(name, testNamespace);
      await apiClient.applyVirtualMachineExample(testNamespace, name);

      try {
        await vmDetailPage.openVm(testNamespace, name);
        await expect
          .poll(() => vmDetailPage.currentUrl())
          .toMatch(vmDetailPage.vmDetailUrlPattern(testNamespace, name));
        await expect(vmDetailPage.detailHeading()).toContainText(name);
        await vmDetailPage.editLabels(name, label);
        await expect(vmDetailPage.tabPanelText(label)).toBeVisible();
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
      await apiClient.applyVirtualMachineExample(testNamespace, name);

      await vmListPage.goToNamespaceList(testNamespace);
      await expect(vmListPage.vmRow(name)).toBeVisible({ timeout: 2 * MINUTE });
      await vmListPage.openDeleteDialog(name);
      await expect(vmListPage.deleteDialogHeading('VirtualMachine')).toBeVisible();
      await vmListPage.confirmDelete();
      await expect(vmListPage.vmRow(name)).toBeHidden({ timeout: TestTimeouts.LONG_OPERATION });
    });
  });
}

registerVmListUiUpdateAndDelete(ADMIN_ONLY_TAG);
registerVmListUiUpdateAndDelete(NON_PRIV_TAG);

test.describe(`VirtualMachines column management ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${T2_TAG}`, () => {
  test.describe.configure({ mode: 'serial' });

  test('ID(CNV-9329) VM list column management toggles Created column', async ({
    apiClient,
    testNamespace,
    vmListPage,
  }) => {
    const name = CRUD_NAMES.vmExample;
    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);
    await vmListPage.goToNamespaceList(testNamespace);
    await expect(vmListPage.vmRow(name, testNamespace)).toBeVisible({ timeout: 2 * MINUTE });

    await vmListPage.openColumnManagement();
    await vmListPage.setColumnChecked('table-column-management-item-created', true);
    await vmListPage.saveColumnManagement();
    await vmListPage.waitForColumnHeader('Created', { namespace: testNamespace });

    await vmListPage.openColumnManagement();
    await vmListPage.setColumnChecked('table-column-management-item-created', false);
    await vmListPage.resetColumnManagement();
    await vmListPage.saveColumnManagement();
    await expect(vmListPage.columnHeader('Name')).toBeVisible();
    await apiClient.deleteVirtualMachine(name, testNamespace);
  });
});

test.describe(`VirtualMachines column management — admin ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test.describe.configure({ mode: 'serial' });

  test('ID(CNV-9329) VM list column management — Node column (admin)', async ({
    apiClient,
    testNamespace,
    vmListPage,
  }) => {
    const name = CRUD_NAMES.vmExample;
    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);
    await vmListPage.goToNamespaceList(testNamespace);
    await expect(vmListPage.vmRow(name, testNamespace)).toBeVisible({ timeout: 2 * MINUTE });

    await vmListPage.openColumnManagement();
    await expect(vmListPage.columnCheckbox('table-column-management-item-node')).toBeVisible();
    await vmListPage.resetColumnManagement();
    await vmListPage.saveColumnManagement();
    await apiClient.deleteVirtualMachine(name, testNamespace);
  });
});
