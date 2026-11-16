import { ADMIN_ONLY_TAG, NON_PRIV_TAG, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-list-fixture';
import { CRUD_NAMES, VM_FROM_CATALOG } from '@/utils/constants';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

import './vm-list-ui.crud.suite';

test.describe(`VirtualMachines UI create from VM wizard ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Create VirtualMachine using tour Create → From Template wizard', async ({
    apiClient,
    testNamespace,
    vmCreationWizardPage,
    vmListPage,
  }) => {
    const vmName = generateRandomVmName('vm-wiz').slice(0, 50);
    let createdName = vmName;

    try {
      await vmCreationWizardPage.openFromVirtualMachinesList(vmListPage, testNamespace);
      await vmCreationWizardPage.advanceFromTemplateToReview(VM_FROM_CATALOG.templateMetadataName);
      await vmCreationWizardPage.clickCreateVirtualMachine();
      await vmCreationWizardPage.page.waitForURL(/VirtualMachine\//, {
        timeout: TestTimeouts.VM_CREATION,
      });
      createdName = (await vmCreationWizardPage.getCreatedVmNameFromUrl()) || vmName;

      const resolvedVm = vmListPage.resolvedVirtualMachineName(testNamespace, createdName);
      await expect
        .poll(() => apiClient.virtualMachineExists(resolvedVm, testNamespace), {
          message: `VirtualMachine ${testNamespace}/${resolvedVm} should exist`,
          timeout: TestTimeouts.VM_CREATION,
        })
        .toBe(true);
      if (vmListPage.isOnVirtualMachineDetail(testNamespace, resolvedVm)) {
        await expect(vmListPage.resourceDetailHeading(resolvedVm)).toBeVisible({
          timeout: TestTimeouts.LONG_OPERATION,
        });
      } else {
        await vmListPage.goToNamespaceList(testNamespace);
        await vmListPage.waitForVmRowInList(resolvedVm, testNamespace);
        await expect(vmListPage.vmListRowLocator(resolvedVm, testNamespace)).toBeVisible({
          timeout: TestTimeouts.LONG_OPERATION,
        });
      }
    } finally {
      await apiClient.deleteVirtualMachine(createdName, testNamespace);
    }
  });
});

test.describe(`VirtualMachines column management ${ROUTE_VIRTUAL_MACHINES_LIST_TAG}`, () => {
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
    await expect(vmListPage.columnHeader('Created')).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    await vmListPage.openColumnManagement();
    await vmListPage.setColumnChecked('table-column-management-item-created', false);
    await vmListPage.saveColumnManagement();
    await vmListPage.waitForColumnHeaderHidden('Created', { namespace: testNamespace });
    await expect(vmListPage.columnHeader('Name')).toBeVisible();
    await expect(vmListPage.columnHeader('Created')).toBeHidden({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await apiClient.deleteVirtualMachine(name, testNamespace);
  });

  test(`ID(CNV-9329) VM list column management — Node column (admin) ${ADMIN_ONLY_TAG}`, async ({
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
