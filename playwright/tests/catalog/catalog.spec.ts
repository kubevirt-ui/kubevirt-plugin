import { GATING_TAG, NON_PRIV_TAG, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import { VM_FROM_CATALOG } from '@/utils/constants';
import { verifyVirtualMachineCreated } from '@/utils/creation-verification';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Catalog read ${ROUTE_CATALOG_TAG} ${GATING_TAG}`, () => {
  test('Catalog grid and filters are visible', async ({ catalogPage, testNamespace }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await expect(catalogPage.catalogGrid()).toBeVisible();
    await expect(catalogPage.filterTextInput()).toBeVisible();
    await expect(catalogPage.gridLinkWithText('Red Hat Enterprise Linux')).toBeVisible();
  });
});

test.describe(`Create VM from catalog ${ROUTE_CATALOG_TAG} ${GATING_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-8848) Quick create VM from RHEL9 template', async ({
    catalogPage,
    vmDetailPage,
    vmListPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_CATALOG.name, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.selectTemplateByMetadataName(VM_FROM_CATALOG.templateMetadataName);
      await catalogPage.quickCreateVm(vmName);

      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
      await vmDetailPage.openVm(testNamespace, vmName);
      await expect(vmDetailPage.overviewStatusWithText('Running')).toBeVisible({
        timeout: TestTimeouts.TEST_VM_CREATION,
      });
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
