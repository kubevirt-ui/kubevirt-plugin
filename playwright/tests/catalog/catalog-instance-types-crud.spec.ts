import { NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import { verifyVirtualMachineCreated } from '@/utils/creation-verification';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

test.describe(`InstanceTypes catalog CRUD ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Create VM from boot volume and delete from VM list in UI', async ({
    catalogPage,
    vmListPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateRandomVmName('it-crud').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.createVirtualMachineFromInstanceTypesCatalog({
        bootVolumeName: 'rhel9',
        series: /N Series/i,
        vmName,
      });

      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
      await vmListPage.goToNamespaceList(testNamespace);
      await expect(vmListPage.vmRow(vmName)).toBeVisible({ timeout: 2 * MINUTE });
      await vmListPage.openDeleteDialog(vmName);
      await vmListPage.confirmDelete(vmName);
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
    catalogPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateRandomVmName('it-custom').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.prepareInstanceTypesCatalogTab();
      await catalogPage.selectBootableVolumeForInstanceTypes('rhel9');
      await catalogPage.selectInstanceTypeSeriesAndSize(/N Series/i);
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
    catalogPage,
    testNamespace,
    apiClient,
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
