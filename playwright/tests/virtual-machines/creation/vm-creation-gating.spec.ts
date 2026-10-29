import { readFileSync } from 'node:fs';

import { GATING_TAG, NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG, ROUTE_VIRTUAL_MACHINES_LIST_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import {
  CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
  CRUD_NAMES,
  DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
  VM_FROM_CATALOG,
} from '@/utils/constants';
import { virtualMachineImportYaml } from '@/utils/manifests';
import { generateNameWithBase, generateRandomVmName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

/**
 * Gating lane: one smoke create per VM entry path (YAML, template catalog, bootable volume).
 * Full UI CRUD (delete, labels, customize) lives in tier1/tier2 specs.
 */
test.describe(`VM gating create from YAML ${ROUTE_VIRTUAL_MACHINES_LIST_TAG} ${GATING_TAG}`, () => {
  test('Create VirtualMachine with import YAML', async ({
    apiClient,
    testNamespace,
    vmListPage,
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
      const resolvedVm = vmListPage.resolvedVirtualMachineName(testNamespace, name);
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
      await apiClient.deleteVirtualMachine(name, testNamespace);
    }
  });
});

test.describe(`VM gating create from template ${ROUTE_CATALOG_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-8848) Quick create VM from RHEL9 template', async ({
    apiClient,
    catalogPage,
    testNamespace,
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
    } finally {
      await apiClient.deleteVirtualMachine(createdName, testNamespace);
    }
  });
});

test.describe(`VM gating instance type YAML and CLI ${ROUTE_CATALOG_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test.use({ acceptDownloads: true });

  test('View YAML and CLI modal supports copy and download', async ({
    catalogPage,
    testNamespace,
  }) => {
    const vmName = generateRandomVmName('yaml-cli').slice(0, 50);

    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.prepareInstanceTypesCatalogTab();
    await catalogPage.prepareInstanceTypeVmCreationForm({
      bootVolumeName: CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
      series: DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
      vmName,
    });

    await catalogPage.openViewYamlAndCliModal(vmName);
    await catalogPage.waitForYamlAndCliModalManifest(vmName);

    const yamlBody = await catalogPage.readYamlAndCliModalEditorText();
    expect(yamlBody).toMatch(/kind:\s*VirtualMachine/i);
    expect(yamlBody).toContain(vmName);

    await catalogPage.clickYamlAndCliModalCopy();
    await catalogPage.waitForYamlAndCliModalManifest(vmName);

    const download = await catalogPage.clickYamlAndCliModalDownloadAndWait();
    expect(download.suggestedFilename()).toBe('code.txt');
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const fileBody = readFileSync(downloadPath!, 'utf8');
    expect(fileBody).toContain(vmName);
    expect(fileBody).toMatch(/kind:\s*VirtualMachine/i);

    await catalogPage.selectYamlAndCliModalTab('CLI');
    await expect
      .poll(() => catalogPage.readYamlAndCliModalEditorText(), {
        message: 'CLI tab should show virtctl create command',
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toMatch(/virtctl create vm/i);

    await catalogPage.clickYamlAndCliModalCopy();
    await expect
      .poll(() => catalogPage.readYamlAndCliModalEditorText(), {
        message: 'CLI tab content should remain after copy',
        timeout: TestTimeouts.ELEMENT_WAIT,
      })
      .toMatch(/virtctl create vm/i);
  });
});

test.describe(`VM gating create from boot volume ${ROUTE_CATALOG_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('Create VM from InstanceTypes catalog (bootable volume + series)', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmListPage,
  }) => {
    const vmName = generateRandomVmName('gating-vol').slice(0, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.prepareInstanceTypesCatalogTab();
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
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
