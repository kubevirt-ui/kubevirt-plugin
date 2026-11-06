import { GATING_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG, ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import { CRUD_NAMES, VM_FROM_CATALOG } from '@/utils/constants';
import { verifyVirtualMachineCreated } from '@/utils/creation-verification';
import { virtualMachineImportYaml } from '@/utils/manifests';
import { generateNameWithBase, generateRandomVmName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

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

async function deleteVmBestEffort(
  apiClient: { deleteVirtualMachine: (name: string, ns: string) => Promise<void> },
  name: string,
  ...namespaces: string[]
): Promise<void> {
  for (const ns of namespaces) {
    await apiClient.deleteVirtualMachine(name, ns).catch(() => undefined);
  }
}

test.describe(`VM gating create from template ${ROUTE_CATALOG_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-8848) Quick create VM from RHEL9 template', async ({
    catalogPage,
    vmListPage,
    page,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_CATALOG.name, 50);

    try {
      // Route `ns` drives product quick-create (not the project bar). Enforce URL ns
      // and drawer-only submit so creates do not orphan into `default` (CNV-8848).
      await catalogPage.quickCreateVmFromTemplateInNamespace(
        testNamespace,
        VM_FROM_CATALOG.templateMetadataName,
        vmName,
      );
      await expect
        .poll(() => page.url(), {
          message: `Quick-created VM should open under ns/${testNamespace}, not default`,
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toMatch(new RegExp(`/ns/${testNamespace}/kubevirt\\.io~v1~VirtualMachine/`));
      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
    } finally {
      // Safety net if route ns still drifts on a future regression.
      await deleteVmBestEffort(apiClient, vmName, testNamespace, 'default');
    }
  });
});

test.describe(`VM gating create from boot volume ${ROUTE_CATALOG_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('Create VM from InstanceTypes catalog (bootable volume + series)', async ({
    catalogPage,
    vmListPage,
    nav,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateRandomVmName('gating-vol').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await nav.switchProject(testNamespace);
      await catalogPage.prepareInstanceTypesCatalogTab();
      await catalogPage.createVirtualMachineFromInstanceTypesCatalog({
        bootVolumeName: 'rhel9',
        series: /N Series/i,
        vmName,
      });
      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
    } finally {
      await deleteVmBestEffort(apiClient, vmName, testNamespace, 'default');
    }
  });
});
