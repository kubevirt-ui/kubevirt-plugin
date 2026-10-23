import {
  ADMIN_ONLY_TAG,
  GATING_TAG,
  NON_PRIV_TAG,
  T1_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { ROUTE_INSTANCE_TYPES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/instance-types-fixture';
import { CRUD_NAMES, DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES } from '@/utils/constants';
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
    const uSeries = catalogPage.instanceTypeSeriesLabel(DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES);
    await expect(uSeries).toBeVisible({ timeout: TestTimeouts.ELEMENT_WAIT });
    await uSeries.click();
    await expect(catalogPage.instanceTypeSizeMenuItem(/^medium:/i)).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await expect(catalogPage.instanceTypeSizeMenuItem(/^large:/i)).toBeVisible();
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
    await instanceTypesPage.deleteFromList(name);
    await expect
      .poll(() => apiClient.virtualMachineInstancetypeExists(name, testNamespace), {
        message: `InstanceType ${testNamespace}/${name} should be deleted`,
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
  });
});

function registerInstanceTypesTier1YamlCrud(userTag: string): void {
  test.describe(`InstanceTypes CRUD from YAML ${ROUTE_INSTANCE_TYPES_TAG} ${T1_TAG} ${userTag}`, () => {
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
      await instanceTypesPage.deleteFromList(name);
      await expect
        .poll(() => apiClient.virtualMachineInstancetypeExists(name, testNamespace), {
          message: `InstanceType ${testNamespace}/${name} should be deleted`,
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe(false);
    });
  });
}

registerInstanceTypesTier1YamlCrud(ADMIN_ONLY_TAG);
registerInstanceTypesTier1YamlCrud(NON_PRIV_TAG);

function registerInstanceTypesTier1UiUpdate(userTag: string): void {
  test.describe(`InstanceTypes UI update ${ROUTE_INSTANCE_TYPES_TAG} ${T1_TAG} ${userTag}`, () => {
    test('Update InstanceType labels in UI', async ({
      apiClient,
      instanceTypesPage,
      testNamespace,
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
}

registerInstanceTypesTier1UiUpdate(ADMIN_ONLY_TAG);
registerInstanceTypesTier1UiUpdate(NON_PRIV_TAG);

function registerInstanceTypesTier2UiDelete(userTag: string): void {
  test.describe(`InstanceTypes UI delete ${ROUTE_INSTANCE_TYPES_TAG} ${T2_TAG} ${userTag}`, () => {
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
}

registerInstanceTypesTier2UiDelete(ADMIN_ONLY_TAG);
registerInstanceTypesTier2UiDelete(NON_PRIV_TAG);
