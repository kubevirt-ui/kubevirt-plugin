/**
 * s390x — VM creation flows (requires a real s390x cluster; mock mode does not apply).
 */
import { S390X_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/s390x-fixture';
import { EnvVariables } from '@/utils/env-variables';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
import { TestTimeouts } from '@/utils/test-config';

test.beforeAll(() => {
  if (!EnvVariables.isS390x) test.skip();
});

test.describe(`s390x VM Creation ${S390X_TAG}`, () => {
  test('Create VM from RHEL9 template succeeds on s390x', async ({ apiClient, testNamespace }) => {
    test.setTimeout(TestTimeouts.TEST_EXTENDED);
    const vmName = generateRandomVmName('s390x-rhel9').slice(0, 50);

    await apiClient.createVmFromTemplate(
      TEMPLATE_METADATA_NAMES.RHEL9,
      vmName,
      testNamespace,
      'openshift',
      false,
    );

    try {
      const created = await apiClient.verifyVmCreated(
        vmName,
        testNamespace,
        TestTimeouts.VM_BOOTUP,
      );
      expect(created.exists, 'VM should be created from RHEL9 s390x template').toBe(true);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });

  test('Catalog shows RHEL9 and hides Windows on s390x', async ({ catalogPage, testNamespace }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.waitForTemplateCatalogReady();

    await expect(catalogPage.gridLinkWithText('Red Hat Enterprise Linux 9 VM')).toBeVisible();

    await catalogPage.filterByOsCheckbox('osName-Windows', true);
    await expect(catalogPage.gridLinkWithText(/Windows/i)).toHaveCount(0);
    await catalogPage.filterByOsCheckbox('osName-Windows', false);
  });

  test('Catalog RHEL + Server combined filter works on s390x', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.waitForTemplateCatalogReady();

    await catalogPage.filterByOsCheckbox('osName-RHEL', true);
    await catalogPage.filterByOsCheckbox('workload-Server', true);
    await expect(catalogPage.gridLinkWithText('Red Hat Enterprise Linux 9 VM')).toBeVisible();
    await expect(catalogPage.gridLinkWithText(/Fedora/i)).toBeHidden();
    await catalogPage.filterByOsCheckbox('workload-Server', false);
    await catalogPage.filterByOsCheckbox('osName-RHEL', false);
  });
});
