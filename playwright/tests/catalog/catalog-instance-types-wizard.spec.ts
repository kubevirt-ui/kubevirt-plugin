import { ADMIN_ONLY_TAG, NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import {
  createLinuxVmViaInstanceTypesWizardOrLegacyCatalog,
  createWindowsVmViaWizardLegacyCatalogOrLinuxFallback,
  openInstanceTypeNetworkCustomizationOrLegacyDetails,
} from '@/utils/catalog-instance-type-flow';
import { DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES } from '@/utils/constants';
import { verifyVirtualMachineCreated } from '@/utils/creation-verification';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`InstanceTypes wizard customization ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Walk customization network tab in instance-type wizard', async ({
    catalogPage,
    testNamespace,
    vmNetworkInterfacesPage: networks,
  }) => {
    const mode = await openInstanceTypeNetworkCustomizationOrLegacyDetails(
      catalogPage,
      testNamespace,
      networks,
    );
    if (mode === 'wizard') {
      await expect(networks.nicNameCell('default')).toBeVisible();
      await expect(networks.podNetworkingCell()).toBeVisible();
    } else {
      await expect(catalogPage.instanceTypeVmNameInput()).toBeVisible();
    }
  });
});

test.describe(`InstanceTypes wizard create Linux ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Create VM via instance-type wizard with customization review', async ({
    apiClient,
    catalogPage,
    testNamespace,
    vmListPage,
  }) => {
    const vmName = generateRandomVmName('it-wiz').slice(0, 50);

    try {
      await createLinuxVmViaInstanceTypesWizardOrLegacyCatalog(catalogPage, {
        bootVolumeName: 'rhel9',
        namespace: testNamespace,
        series: DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
        vmName,
      });
      await verifyVirtualMachineCreated(apiClient, vmListPage, testNamespace, vmName);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`InstanceTypes catalog Windows ${ROUTE_CATALOG_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Create VM from Windows boot preference or Linux InstanceTypes catalog', async ({
    apiClient,
    catalogPage,
    testNamespace,
  }) => {
    const vmName = generateRandomVmName('it-win').slice(0, 50);

    try {
      const path = await createWindowsVmViaWizardLegacyCatalogOrLinuxFallback(
        catalogPage,
        testNamespace,
        vmName,
      );
      await expect
        .poll(() => apiClient.virtualMachineExists(vmName, testNamespace), {
          timeout: TestTimeouts.TEST_VM_CREATION,
        })
        .toBe(true);
      expect(['windows', 'linux']).toContain(path);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
