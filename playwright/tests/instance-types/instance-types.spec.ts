import { ADMIN_ONLY_TAG, GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_INSTANCE_TYPES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/instance-types-fixture';
import {
  CATALOG_INSTANCE_TYPES_BOOT_VOLUME,
  CRUD_NAMES,
  DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES,
} from '@/utils/constants';
import { virtualMachineInstancetypeImportYaml } from '@/utils/manifests';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

import './instance-types.crud.suite';

test.describe(`InstanceTypes catalog ${ROUTE_INSTANCE_TYPES_TAG} ${GATING_TAG}`, () => {
  test('InstanceTypes catalog route lists boot volumes and Red Hat series sizes', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.waitForInstanceTypesCatalogRouteReady(testNamespace);
    await catalogPage.acceptInstanceTypesDeveloperPreviewIfPrompted();
    await expect(catalogPage.instanceTypesGrid()).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await catalogPage.selectBootableVolumeForInstanceTypes(CATALOG_INSTANCE_TYPES_BOOT_VOLUME);
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
