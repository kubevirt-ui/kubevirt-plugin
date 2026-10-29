import { ADMIN_ONLY_TAG, T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_INSTANCE_TYPES_TAG, ROUTE_PREFERENCES_TAG } from '@/data-models/route-tags';
import { expect, test as scenarioTest } from '@/fixtures/scenario-test-fixture';
import { InstanceTypesPage } from '@/page-objects/instance-types-page';
import { PreferencesPage } from '@/page-objects/preferences-page';
import { CRUD_NAMES } from '@/utils/constants';
import { generateNameWithBase, generateRandomLabel } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

/** Console Edit labels modal is a single global `#modal-container`; run back-to-back. */
const test = scenarioTest.extend<{
  instanceTypesPage: InstanceTypesPage;
  preferencesPage: PreferencesPage;
}>({
  instanceTypesPage: async ({ page }, use) => {
    await use(new InstanceTypesPage(page));
  },
  preferencesPage: async ({ page }, use) => {
    await use(new PreferencesPage(page));
  },
});

test.describe('Console resource summary labels', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe(`InstanceType ${ROUTE_INSTANCE_TYPES_TAG} ${T1_TAG}`, () => {
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

  test.describe(`ClusterPreference ${ROUTE_PREFERENCES_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
    test('Update ClusterPreference labels in UI', async ({ apiClient, preferencesPage }) => {
      const name = generateNameWithBase(CRUD_NAMES.clusterPreferenceExample, 50);
      const label = generateRandomLabel('pref');

      await apiClient.deleteVirtualMachineClusterPreference(name);
      await apiClient.applyVirtualMachineClusterPreferenceExample(name);
      await expect
        .poll(() => apiClient.virtualMachineClusterPreferenceExists(name), {
          timeout: TestTimeouts.RESOURCE_CREATION,
        })
        .toBe(true);

      try {
        await preferencesPage.openDetail(name);
        await preferencesPage.editLabels(name, label);
        await expect(preferencesPage.labelOnDetail(label)).toBeVisible();
      } finally {
        await apiClient.deleteVirtualMachineClusterPreference(name);
      }
    });
  });
});
