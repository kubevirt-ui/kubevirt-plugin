import { GATING_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG, ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import { CRUD_NAMES, VM_FROM_CATALOG } from '@/utils/constants';
import { verifyVirtualMachineCreated } from '@/utils/creation-verification';
import { virtualMachineImportYaml } from '@/utils/manifests';
import { generateNameWithBase, generateRandomVmName } from '@/utils/random-data-generator';

/**
 * Gating lane: one smoke create per VM entry path (YAML, template catalog, bootable volume).
 * Full UI CRUD (delete, labels, customize) lives in tier1/tier2 specs.
 */
test.describe(`VM gating create from YAML ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${GATING_TAG}`, () => {
  test('Create VirtualMachine with import YAML', async ({
    vmListPage,
    testNamespace,
    apiClient,
  }) => {
    const name = generateNameWithBase(`${CRUD_NAMES.vmExample}-gating-yaml`, 50);

    await apiClient.deleteVirtualMachine(name, testNamespace);
    await expect
      .poll(() => apiClient.virtualMachineExists(name, testNamespace), {
        message: `pre-test cleanup: VirtualMachine ${testNamespace}/${name} should be absent`,
      })
      .toBe(false);

    try {
      await vmListPage.goToNamespaceList(testNamespace);
      await vmListPage.createFromYaml(virtualMachineImportYaml({ name, namespace: testNamespace }));
      await expect
        .poll(() => vmListPage.currentUrl())
        .toMatch(vmListPage.virtualMachineDetailUrlPattern(name));
      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, name);
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VM gating create from template ${ROUTE_CATALOG_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-8848) Quick create VM from RHEL9 template', async ({
    catalogPage,
    vmListPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_CATALOG.name, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.selectTemplateByMetadataName(VM_FROM_CATALOG.templateMetadataName);
      await catalogPage.openLegacyQuickCreateModal();
      await catalogPage.quickCreateVm(vmName);
      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`VM gating create from boot volume ${ROUTE_CATALOG_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('Create VM from InstanceTypes catalog (bootable volume + series)', async ({
    catalogPage,
    vmListPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateRandomVmName('gating-vol').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.prepareInstanceTypesCatalogTab();
      await catalogPage.createVirtualMachineFromInstanceTypesCatalog({
        bootVolumeName: 'rhel9',
        series: /N Series/i,
        vmName,
      });
      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
