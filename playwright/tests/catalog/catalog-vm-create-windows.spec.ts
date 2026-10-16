import { ADMIN_ONLY_TAG, NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { test } from '@/fixtures/catalog-fixture';
import {
  CATALOG_DISK_HTTP_IMAGE_URL,
  CATALOG_DISK_PVC_CLONE_NAME_PREFIX,
  CATALOG_DISK_PVC_CLONE_NAMESPACE,
  CATALOG_DISK_REGISTRY_IMAGE,
  TEMPLATE_WIN10,
  VM_FROM_WINDOWS_CATALOG,
  WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB,
} from '@/utils/constants';
import { verifyVirtualMachineCreatedAndOpenDetail } from '@/utils/creation-verification';
import { generateNameWithBase } from '@/utils/random-data-generator';

test.describe(`Create Windows VM from catalog (admin) ${ROUTE_CATALOG_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-8925) Create windows VM from ISO and verify rootdisk size', async ({
    catalogPage,
    vmListPage,
    vmDetailPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_WINDOWS_CATALOG.name, 50);

    try {
      await catalogPage.createWindowsVmFromIsoInCatalog(
        testNamespace,
        vmName,
        CATALOG_DISK_HTTP_IMAGE_URL,
        WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB,
      );
      await verifyVirtualMachineCreatedAndOpenDetail(
        apiClient,
        vmListPage,
        vmDetailPage,
        testNamespace,
        vmName,
      );
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`Create Windows VM from catalog (non-priv) ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-8925) Create windows VM from ISO and verify rootdisk size', async ({
    catalogPage,
    vmListPage,
    vmDetailPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_WINDOWS_CATALOG.name, 50);

    try {
      await vmListPage.goToCreateFromCatalog(testNamespace);
      await catalogPage.expectLoadedInNamespace(testNamespace);
      await catalogPage.selectWindowsTemplate(TEMPLATE_WIN10.metadataName);
      await catalogPage.createWindowsVmFromIsoCustomizeFlow(
        vmName,
        CATALOG_DISK_HTTP_IMAGE_URL,
        WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB,
      );

      await verifyVirtualMachineCreatedAndOpenDetail(
        apiClient,
        vmListPage,
        vmDetailPage,
        testNamespace,
        vmName,
      );
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`Create Windows VM from catalog — alternate disk sources ${ROUTE_CATALOG_TAG} ${T2_TAG} ${NON_PRIV_TAG}`, () => {
  test('ID(CNV-8926) Create windows VM from registry disk and verify rootdisk size', async ({
    catalogPage,
    vmListPage,
    vmDetailPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_WINDOWS_CATALOG.name, 50);

    try {
      await catalogPage.createWindowsVmWithDiskSourceInCatalog(
        testNamespace,
        vmName,
        () => catalogPage.selectDiskSourceRegistry(CATALOG_DISK_REGISTRY_IMAGE),
        { rootDiskSizeGiB: WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB },
      );
      await verifyVirtualMachineCreatedAndOpenDetail(
        apiClient,
        vmListPage,
        vmDetailPage,
        testNamespace,
        vmName,
      );
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });

  test('ID(CNV-8927) Create windows VM from blank disk and verify rootdisk size', async ({
    catalogPage,
    vmListPage,
    vmDetailPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_WINDOWS_CATALOG.name, 50);

    try {
      await catalogPage.createWindowsVmWithDiskSourceInCatalog(
        testNamespace,
        vmName,
        () => catalogPage.selectDiskSourceBlank(),
        { rootDiskSizeGiB: WINDOWS10_CATALOG_ROOT_DISK_SIZE_GIB },
      );
      await verifyVirtualMachineCreatedAndOpenDetail(
        apiClient,
        vmListPage,
        vmDetailPage,
        testNamespace,
        vmName,
      );
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });

  test('ID(CNV-8928) Create windows VM from PVC clone and verify rootdisk on review', async ({
    catalogPage,
    vmListPage,
    vmDetailPage,
    testNamespace,
    apiClient,
  }) => {
    const vmName = generateNameWithBase(VM_FROM_WINDOWS_CATALOG.name, 50);

    try {
      await catalogPage.createWindowsVmWithDiskSourceInCatalog(
        testNamespace,
        vmName,
        () =>
          catalogPage.selectDiskSourcePvcClone(
            CATALOG_DISK_PVC_CLONE_NAMESPACE,
            CATALOG_DISK_PVC_CLONE_NAME_PREFIX,
          ),
        {},
      );
      await verifyVirtualMachineCreatedAndOpenDetail(
        apiClient,
        vmListPage,
        vmDetailPage,
        testNamespace,
        vmName,
      );
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
