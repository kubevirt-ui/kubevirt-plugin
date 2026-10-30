import { GATING_TAG, NON_PRIV_TAG, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import { VM_FROM_CATALOG } from '@/utils/constants';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Catalog read ${ROUTE_CATALOG_TAG} ${GATING_TAG}`, () => {
  test('Catalog grid and filters are visible', async ({ catalogPage, testNamespace }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.waitForTemplateCatalogReady();
    await expect(catalogPage.filterTextInput()).toBeVisible();
    await expect(catalogPage.gridLinkWithText('Red Hat Enterprise Linux')).toBeVisible();
  });
});

test.describe(`Catalog template filter ${ROUTE_CATALOG_TAG} ${GATING_TAG}`, () => {
  test('Filter catalog grid by OS name', async ({ catalogPage, testNamespace }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.waitForTemplateCatalogReady();
    await catalogPage.filterByText('windows');
    await expect(catalogPage.gridLinkWithText(/Windows/i)).toBeVisible();
    await expect(catalogPage.gridLinkWithText('Red Hat Enterprise Linux')).toBeHidden();
  });
});

test.describe(`Create VM from template — tier1 ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-8848) Quick-created VM reaches Running on overview', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_CATALOG.name, 50);
    let createdName = vmName;

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.selectTemplateByMetadataName(VM_FROM_CATALOG.templateMetadataName);
      createdName = await catalogPage.quickCreateVm(vmName);

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
      await vmDetailPage.openVm(testNamespace, createdName);
      await expect(vmDetailPage.overviewStatusWithText('Running')).toBeVisible({
        timeout: TestTimeouts.TEST_VM_CREATION,
      });
    } finally {
      await apiClient.deleteVirtualMachine(createdName, testNamespace);
    }
  });
});
