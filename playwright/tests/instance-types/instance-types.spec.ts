import { ADMIN_ONLY_TAG, GATING_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_INSTANCE_TYPES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/instance-types-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { virtualMachineInstancetypeImportYaml } from '@/utils/manifests';
import { generateNameWithBase, generateRandomLabel } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`InstanceTypes catalog ${ROUTE_INSTANCE_TYPES_TAG} ${GATING_TAG}`, () => {
  test('InstanceTypes catalog route lists boot volumes and Red Hat series sizes', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.waitForInstanceTypesCatalogRouteReady(testNamespace);
    await catalogPage.acceptInstanceTypesDeveloperPreviewIfPrompted();
    await catalogPage.instanceTypesGrid().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await catalogPage.selectBootableVolumeForInstanceTypes('rhel9');
    await catalogPage.instanceTypeSeriesLabel(/N Series/i).click();
    await expect(catalogPage.instanceTypeSizeMenuItem(/^medium:/i)).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await expect(catalogPage.instanceTypeSizeMenuItem(/^large: /i)).toBeVisible();
  });
});

test.describe(`InstanceTypes read ${ROUTE_INSTANCE_TYPES_TAG} ${GATING_TAG}`, () => {
  test('Cluster InstanceTypes list includes common sizes', async ({ instanceTypesPage }) => {
    await instanceTypesPage.waitForClusterListReady();
    await instanceTypesPage.goToClusterList();
    await expect(instanceTypesPage.row(/u1\.|o1\.|m1\./i).first()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
  });
});

test.describe(`InstanceTypes UI create YAML ${ROUTE_INSTANCE_TYPES_TAG} ${GATING_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Create VirtualMachineInstancetype with YAML and delete in UI', async ({
    instanceTypesPage,
    testNamespace,
    apiClient,
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
    await instanceTypesPage.deleteFromList(name);
    await expect
      .poll(() => apiClient.virtualMachineInstancetypeExists(name, testNamespace), {
        message: `InstanceType ${testNamespace}/${name} should be deleted`,
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
  });
});

test.describe(`InstanceTypes UI update ${ROUTE_INSTANCE_TYPES_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Update InstanceType labels in UI', async ({
    instanceTypesPage,
    testNamespace,
    apiClient,
  }) => {
    await instanceTypesPage.waitForUserListReady(testNamespace);
    const name = generateNameWithBase(CRUD_NAMES.instanceTypeExample, 50);
    const label = generateRandomLabel('it');

    await apiClient.deleteVirtualMachineInstancetype(name, testNamespace);
    await apiClient.applyVirtualMachineInstancetypeExample(testNamespace, name);
    await expect
      .poll(() => apiClient.virtualMachineInstancetypeExists(name, testNamespace), {
        message: `InstanceType ${testNamespace}/${name} should exist after API create`,
        timeout: TestTimeouts.RESOURCE_CREATION,
      })
      .toBe(true);

    try {
      await instanceTypesPage.openDetail(testNamespace, name);
      await expect(instanceTypesPage.resourceTitle()).toContainText(name);
      await instanceTypesPage.editLabels(name, label);
      await expect(instanceTypesPage.labelOnDetail(label)).toBeVisible();
    } finally {
      await apiClient.deleteVirtualMachineInstancetype(name, testNamespace);
    }
  });
});

test.describe(`InstanceTypes UI delete ${ROUTE_INSTANCE_TYPES_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Delete InstanceType from list in UI', async ({
    instanceTypesPage,
    testNamespace,
    apiClient,
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
