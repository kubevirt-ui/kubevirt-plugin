import { NON_PRIV_TAG, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import {
  CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
  DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
} from '@/utils/constants';
import {
  generateEd25519SshPublicKey,
  generateNameWithBase,
  generateRandomVmName,
} from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM detail Configuration SSH ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Public SSH key from InstanceTypes catalog shows on Configuration SSH tab', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmDetailPage,
    vmListPage,
  }) => {
    const vmName = generateRandomVmName('ssh-vm').slice(0, 50);
    const secretName = generateNameWithBase('pw-ssh', 40);
    const publicSshKey = generateEd25519SshPublicKey();

    await apiClient.deleteVirtualMachine(vmName, testNamespace);

    try {
      await catalogPage.openCatalogInNamespace(testNamespace);
      await catalogPage.prepareInstanceTypesCatalogTab();
      await catalogPage.createVirtualMachineFromInstanceTypesCatalog({
        bootVolumeName: CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
        publicSshKey: { publicKey: publicSshKey, secretName },
        series: DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
        vmName,
      });
      const createdName =
        catalogPage.currentUrl().match(/kubevirt\.io~v1~VirtualMachine\/([^/?#]+)/)?.[1] ?? vmName;
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
      await vmDetailPage.goToSshTab();
      await vmDetailPage.expandSshAuthorizedKeySectionIfNeeded();
      await expect(vmDetailPage.authorizedSshSecretName(secretName)).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      const toDelete =
        catalogPage.currentUrl().match(/kubevirt\.io~v1~VirtualMachine\/([^/?#]+)/)?.[1] ?? vmName;
      await apiClient.deleteVirtualMachine(toDelete, testNamespace);
    }
  });
});
