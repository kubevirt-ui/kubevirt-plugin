import { NON_PRIV_TAG, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import { createLinuxVmViaInstanceTypesWizardOrLegacyCatalog } from '@/utils/catalog-instance-type-flow';
import {
  CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
  DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
  VM_FOLDER_LABEL,
  VM_FROM_CATALOG,
} from '@/utils/constants';
import { generateNameWithBase, generateRandomFolderName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';
import type { VmDetailPage } from '@/page-objects/vm-detail-page';
import type RequestContextClient from '@/clients/request-context-client';

async function expectVmFolderLabel(
  apiClient: RequestContextClient,
  vmDetailPage: VmDetailPage,
  namespace: string,
  vmName: string,
  folderName: string,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const vm = await apiClient.getVirtualMachine(namespace, vmName);
        return vm?.metadata?.labels?.[VM_FOLDER_LABEL];
      },
      {
        message: `VirtualMachine ${namespace}/${vmName} should have folder label`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    )
    .toBe(folderName);
  await vmDetailPage.openVm(namespace, vmName);
  await expect
    .poll(async () => (await vmDetailPage.overviewFolderValue().textContent())?.trim() ?? '', {
      message: `VM overview Folder should show ${folderName}`,
      timeout: TestTimeouts.LONG_OPERATION,
    })
    .toBe(folderName);
}

test.describe(`Template catalog VM folder ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Quick create with new folder sets VM folder label and overview', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
  }) => {
    const folderName = generateRandomFolderName();
    const vmName = generateNameWithBase(VM_FROM_CATALOG.name, 50);
    let createdName = vmName;

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.selectTemplateByMetadataName(VM_FROM_CATALOG.templateMetadataName);
      await expect(catalogPage.templateDrawerFolderLabel()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      createdName = await catalogPage.quickCreateVm(vmName, { folderName });
      await expect
        .poll(() => apiClient.virtualMachineExists(createdName, testNamespace), {
          message: `VirtualMachine ${testNamespace}/${createdName} should exist`,
          timeout: TestTimeouts.VM_CREATION,
        })
        .toBe(true);
      await expectVmFolderLabel(apiClient, vmDetailPage, testNamespace, createdName, folderName);
    } finally {
      await apiClient.deleteVirtualMachine(createdName, testNamespace);
    }
  });
});

test.describe(`InstanceTypes VM folder ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Create with new folder sets VM folder label and overview', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    const folderName = generateRandomFolderName();
    const vmName = generateNameWithBase('pw-it-folder', 50);

    try {
      await createLinuxVmViaInstanceTypesWizardOrLegacyCatalog(catalogPage, {
        bootVolumeName: CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
        folderName,
        namespace: testNamespace,
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
      await expectVmFolderLabel(apiClient, vmDetailPage, testNamespace, resolvedVm, folderName);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
