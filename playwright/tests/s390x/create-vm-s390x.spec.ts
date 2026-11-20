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
});
