import { T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_INSTANCE_TYPES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/instance-types-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`InstanceTypes UI delete ${ROUTE_INSTANCE_TYPES_TAG} ${T2_TAG}`, () => {
  test('Delete InstanceType from list in UI', async ({
    apiClient,
    instanceTypesPage,
    testNamespace,
  }) => {
    await instanceTypesPage.waitForUserListReady(testNamespace);
    const name = generateNameWithBase(`${CRUD_NAMES.instanceTypeExample}-del`, 50);

    await apiClient.deleteVirtualMachineInstancetype(name, testNamespace);
    await apiClient.applyVirtualMachineInstancetypeExample(testNamespace, name);
    await expect
      .poll(() => apiClient.virtualMachineInstancetypeExists(name, testNamespace), {
        message: `InstanceType ${testNamespace}/${name} should exist after API create`,
        timeout: TestTimeouts.RESOURCE_CREATION,
      })
      .toBe(true);

    await instanceTypesPage.goToUserList(testNamespace);
    await instanceTypesPage.filterByName(name);
    await expect(instanceTypesPage.row(name)).toBeVisible();
    await instanceTypesPage.deleteFromList(name);
    await expect
      .poll(() => apiClient.virtualMachineInstancetypeExists(name, testNamespace), {
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
  });
});
