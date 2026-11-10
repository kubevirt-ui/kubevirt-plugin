/**
 * s390x — VM list / template name behaviour.
 *
 * Mock mode covers catalog/list UI smoke; creating a VM from an s390x-suffixed
 * template requires a real s390x cluster.
 */
import { S390X_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/s390x-fixture';
import { EnvVariables } from '@/utils/env-variables';
import { generateRandomVmName } from '@/utils/random-data-generator';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
import { TestTimeouts } from '@/utils/test-config';

test.beforeAll(() => {
  if (!EnvVariables.isS390x && !EnvVariables.s390xMockEnabled) test.skip();
});

test.describe(`s390x VM List ${S390X_TAG}`, () => {
  test('VM list shows VM created from s390x-suffixed RHEL9 template', async ({
    apiClient,
    isRealS390x,
    testNamespace,
    vmListPage,
  }) => {
    if (!isRealS390x) {
      test.skip(true, 'Creating from s390x-suffixed templates requires a real s390x cluster');
    }

    test.setTimeout(TestTimeouts.TEST_EXTENDED);
    const vmName = generateRandomVmName('s390x-vm-list').slice(0, 50);

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
      expect(created.exists, 'VM should be created').toBe(true);

      await vmListPage.goToNamespaceList(testNamespace);
      await vmListPage.waitForVmRowInList(vmName, testNamespace);
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});

test.describe(`s390x Templates List ${S390X_TAG}`, () => {
  test('RHEL9 template metadata name includes s390x suffix on real cluster', async ({
    isRealS390x,
    templatesPage,
  }) => {
    if (!isRealS390x) {
      test.skip(true, 's390x-suffixed common templates exist only on real s390x clusters');
    }

    const s390xTemplateName = TEMPLATE_METADATA_NAMES.RHEL9;
    expect(s390xTemplateName).toContain('s390x');

    await templatesPage.goToList();
    await templatesPage.filterByName(s390xTemplateName);
    await expect(templatesPage.rowLink(s390xTemplateName)).toBeVisible();
  });
});
