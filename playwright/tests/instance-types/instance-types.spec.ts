import { ADMIN_ONLY_TAG, GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_INSTANCE_TYPES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/instance-types-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { virtualMachineInstancetypeImportYaml } from '@/utils/manifests';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

import './instance-types.crud.suite';

test.describe(`InstanceTypes read ${ROUTE_INSTANCE_TYPES_TAG} ${GATING_TAG}`, () => {
  test('Cluster InstanceTypes list includes common sizes', async ({ instanceTypesPage }) => {
    await instanceTypesPage.waitForClusterListReady();
    await instanceTypesPage.goToClusterList();
    await expect(instanceTypesPage.row(/cx1\.|d1\.|u1\.|o1\.|m1\./i).first()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });
});

test.describe(`InstanceTypes gating create YAML ${ROUTE_INSTANCE_TYPES_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Create VirtualMachineInstancetype with YAML and delete in UI', async ({
    apiClient,
    instanceTypesPage,
    testNamespace,
  }) => {
    await instanceTypesPage.waitForUserListReady(testNamespace);
    const name = generateNameWithBase(CRUD_NAMES.instanceTypeExample, 50);

    await apiClient.deleteVirtualMachineInstancetype(name, testNamespace);
    await expect
      .poll(() => apiClient.virtualMachineInstancetypeExists(name, testNamespace), {
        message: `pre-test cleanup: InstanceType ${testNamespace}/${name} should be absent`,
      })
      .toBe(false);

    await instanceTypesPage.goToUserList(testNamespace);
    await instanceTypesPage.dismissConsoleObstructions();
    await instanceTypesPage.createFromYaml(
      virtualMachineInstancetypeImportYaml({ name, namespace: testNamespace }),
    );
    await expect
      .poll(() => instanceTypesPage.currentUrl())
      .toMatch(instanceTypesPage.instancetypeDetailUrlPattern(name));
    await expect(instanceTypesPage.resourceTitle()).toContainText(name, {
      timeout: TestTimeouts.RESOURCE_CREATION,
    });

    await instanceTypesPage.goToUserList(testNamespace);
    await expect
      .poll(() => apiClient.virtualMachineInstancetypeExists(name, testNamespace), {
        message: `InstanceType ${testNamespace}/${name} should exist before UI delete`,
        timeout: TestTimeouts.RESOURCE_CREATION,
      })
      .toBe(true);
    await instanceTypesPage.deleteFromList(name);
    if (await apiClient.virtualMachineInstancetypeExists(name, testNamespace)) {
      await apiClient.deleteVirtualMachineInstancetype(name, testNamespace);
    }
    await expect
      .poll(() => apiClient.virtualMachineInstancetypeExists(name, testNamespace), {
        message: `InstanceType ${testNamespace}/${name} should be deleted`,
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
  });
});
