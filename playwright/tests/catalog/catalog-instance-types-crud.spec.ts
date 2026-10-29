import { ADMIN_ONLY_TAG, NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import {
  CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
  CRUD_NAMES,
  DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
} from '@/utils/constants';
import { generateNameWithBase, generateRandomVmName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`InstanceTypes catalog CRUD ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Create VM from boot volume and delete from VM list in UI', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    const vmName = generateRandomVmName('it-crud').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.createVirtualMachineFromInstanceTypesCatalog({
        bootVolumeName: CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
        series: DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
        vmName,
      });

      const resolvedVm = vmListPage.resolvedVirtualMachineName(testNamespace, vmName);
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
      await vmListPage.deleteFromDetail(vmDetailPage, vmName);
      await expect
        .poll(() => apiClient.virtualMachineExists(vmName, testNamespace), {
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe(false);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`InstanceTypes catalog customize name ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Legacy InstanceTypes flow accepts custom VM name before create', async ({
    apiClient,
    catalogPage,
    testNamespace,
  }) => {
    const vmName = generateRandomVmName('it-custom').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.prepareInstanceTypesCatalogTab();
      await catalogPage.selectBootableVolumeForInstanceTypes(CATALOG_INSTANCE_TYPES_BOOT_VOLUME);
      await catalogPage.selectInstanceTypeSeriesAndSize(DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES);
      await catalogPage.instanceTypeVmNameInput().fill(vmName);
      await expect(catalogPage.instanceTypeCreateVirtualMachineButton()).toBeEnabled({
        timeout: TestTimeouts.LONG_OPERATION,
      });
      await catalogPage.acceptInstanceTypesDeveloperPreviewIfPrompted();
      await catalogPage.instanceTypeCreateVirtualMachineButton().click();
      await expect
        .poll(() => apiClient.virtualMachineExists(vmName, testNamespace), {
          timeout: TestTimeouts.TEST_VM_CREATION,
        })
        .toBe(true);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`InstanceTypes catalog alternate series ${ROUTE_CATALOG_TAG} ${T2_TAG} ${NON_PRIV_TAG}`, () => {
  test('Select boot volume and M Series before create', async ({
    apiClient,
    catalogPage,
    testNamespace,
  }) => {
    const vmName = generateRandomVmName('pw-it-m').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.prepareInstanceTypesCatalogTab();
      await catalogPage.selectBootableVolumeForInstanceTypes('fedora');
      await catalogPage.selectInstanceTypeSeriesAndSize(/M Series/i);
      await expect(catalogPage.instanceTypeVmNameInput()).toBeVisible();
      await catalogPage.instanceTypeVmNameInput().fill(vmName);
      await expect(catalogPage.instanceTypeCreateVirtualMachineButton()).toBeEnabled({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`InstanceTypes catalog user-provided type ${ROUTE_CATALOG_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Create VM from User provided VirtualMachineInstancetype', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmListPage,
  }) => {
    test.setTimeout(TestTimeouts.TEST_BUDGET_LARGE);
    const instanceTypeName = generateNameWithBase(`${CRUD_NAMES.instanceTypeExample}-catalog`, 50);
    const vmName = generateRandomVmName('pw-it-user').slice(0, 50);

    await apiClient.deleteVirtualMachine(vmName, testNamespace);
    await apiClient.deleteVirtualMachineInstancetype(instanceTypeName, testNamespace);
    await apiClient.applyVirtualMachineInstancetypeExample(testNamespace, instanceTypeName);
    await expect
      .poll(() => apiClient.virtualMachineInstancetypeExists(instanceTypeName, testNamespace), {
        message: `VirtualMachineInstancetype ${testNamespace}/${instanceTypeName} should exist`,
        timeout: TestTimeouts.RESOURCE_CREATION,
      })
      .toBe(true);
    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.createVirtualMachineFromInstanceTypesCatalog({
        bootVolumeName: CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
        userInstanceTypeName: instanceTypeName,
        vmName,
      });
      const resolvedVm = vmListPage.resolvedVirtualMachineName(testNamespace, vmName);
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
      const vm = await apiClient.getVirtualMachine(testNamespace, resolvedVm);
      expect(vm?.spec?.instancetype?.name).toBe(instanceTypeName);
      expect(vm?.spec?.instancetype?.kind).toBe('VirtualMachineInstancetype');
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
      await apiClient.deleteVirtualMachineInstancetype(instanceTypeName, testNamespace);
    }
  });
});
