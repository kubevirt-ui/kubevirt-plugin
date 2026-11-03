import { ADMIN_ONLY_TAG, NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import {
  CATALOG_DISK_HTTP_IMAGE_URL,
  CATALOG_DISK_REGISTRY_IMAGE,
  TEMPLATE_RHEL9,
  VM_FROM_WINDOWS_CATALOG,
  WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB,
} from '@/utils/constants';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`Create Windows VM from catalog (admin) ${ROUTE_CATALOG_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-8925) Create windows VM from ISO and verify rootdisk size', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_WINDOWS_CATALOG.name, 50);

    try {
      await catalogPage.createWindowsVmFromIsoInCatalog(
        testNamespace,
        vmName,
        CATALOG_DISK_HTTP_IMAGE_URL,
        WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB,
      );
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
      await vmDetailPage.openVm(testNamespace, resolvedVm);
      await expect(vmDetailPage.detailHeading()).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      await apiClient
        .deleteVirtualMachine(
          catalogPage.currentUrl().match(/VirtualMachine\/([^/?#]+)/)?.[1] ?? vmName,
          testNamespace,
        )
        .catch(() => undefined);
    }
  });
});

test.describe(`Create Windows VM from catalog (non-priv) ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-8925) Create VM from catalog quick create (non-priv)', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    const vmName = generateNameWithBase(`${VM_FROM_WINDOWS_CATALOG.name}-np`, 50);
    let createdName = vmName;

    try {
      await vmListPage.goToCreateFromCatalog(testNamespace);
      await catalogPage.waitForCatalogInNamespace(testNamespace);
      await expect
        .poll(() => catalogPage.currentUrl())
        .toMatch(catalogPage.catalogEntryUrlPattern(testNamespace));
      await catalogPage.selectTemplateByMetadataName(TEMPLATE_RHEL9.metadataName);
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
      await vmDetailPage.openVm(testNamespace, resolvedVm);
      await expect(vmDetailPage.detailHeading()).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      await apiClient.deleteVirtualMachine(createdName, testNamespace);
    }
  });
});

test.describe(`Create Windows VM from catalog — alternate disk sources ${ROUTE_CATALOG_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test.describe.configure({ mode: 'serial' });

  test('ID(CNV-8926) Create windows VM from registry disk and verify rootdisk size', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_WINDOWS_CATALOG.name, 50);

    try {
      await catalogPage.createWindowsVmWithDiskSourceInCatalog(
        testNamespace,
        vmName,
        () => catalogPage.selectDiskSourceRegistry(CATALOG_DISK_REGISTRY_IMAGE),
        { rootDiskSizeGiB: WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB },
      );
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
      await vmDetailPage.openVm(testNamespace, resolvedVm);
      await expect(vmDetailPage.detailHeading()).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });

  test('ID(CNV-8927) Create windows VM from blank disk and verify rootdisk size', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_WINDOWS_CATALOG.name, 50);

    try {
      await catalogPage.createWindowsVmWithDiskSourceInCatalog(
        testNamespace,
        vmName,
        () => catalogPage.selectDiskSourceBlank(),
        { rootDiskSizeGiB: WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB },
      );
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
      await vmDetailPage.openVm(testNamespace, resolvedVm);
      await expect(vmDetailPage.detailHeading()).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });

  test('ID(CNV-8928) Create windows VM from PVC clone and verify rootdisk on review', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    test.setTimeout(TestTimeouts.TEST_BUDGET_LARGE);
    const vmName = generateNameWithBase(VM_FROM_WINDOWS_CATALOG.name, 50);
    const clonePvcName = generateNameWithBase('pw-catalog-pvc-clone', 50);
    const osImagesNs = process.env.OS_IMAGES_NS || 'openshift-virtualization-os-images';
    const clusterPvcs = await apiClient.listPersistentVolumeClaimNames(osImagesNs);
    const clusterPvc = clusterPvcs.length
      ? catalogPage.pickCatalogPvcCloneName(clusterPvcs, clonePvcName)
      : undefined;
    const pvcNamespace = clusterPvc ? osImagesNs : testNamespace;
    const pvcName = clusterPvc ?? clonePvcName;

    if (!clusterPvc) {
      await catalogPage.ensurePvcCloneSource(
        apiClient,
        testNamespace,
        clonePvcName,
        WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB,
      );
    }
    await catalogPage.warmNamespacePvcInformer(pvcNamespace);

    try {
      await catalogPage.createWindowsVmWithDiskSourceInCatalog(
        testNamespace,
        vmName,
        () => catalogPage.selectDiskSourcePvcClone(pvcNamespace, pvcName),
        {},
      );
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
      await vmDetailPage.openVm(testNamespace, resolvedVm);
      await expect(vmDetailPage.detailHeading()).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
      if (!clusterPvc) {
        await apiClient.deletePersistentVolumeClaim(clonePvcName, testNamespace);
      }
    }
  });
});

test.describe(`Create VM from catalog quick create ${ROUTE_CATALOG_TAG} ${T2_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-8926) Catalog quick create from RHEL template (non-priv)', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    const vmName = generateNameWithBase(`${VM_FROM_WINDOWS_CATALOG.name}-t2`, 50);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.selectTemplateByMetadataName(TEMPLATE_RHEL9.metadataName);
      await catalogPage.openLegacyQuickCreateModal();
      await catalogPage.quickCreateVm(vmName);
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
      await vmDetailPage.openVm(testNamespace, resolvedVm);
      await expect(vmDetailPage.detailHeading()).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
