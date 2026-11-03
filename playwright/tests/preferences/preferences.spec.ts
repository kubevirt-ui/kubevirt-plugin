import { ADMIN_ONLY_TAG, GATING_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_PREFERENCES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/preferences-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { virtualMachineClusterPreferenceImportYaml } from '@/utils/manifests';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

import './preferences-read.suite';

test.describe(`Cluster preferences gating create YAML ${ROUTE_PREFERENCES_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Create VirtualMachineClusterPreference with YAML and delete in UI', async ({
    apiClient,
    preferencesPage,
  }) => {
    const name = generateNameWithBase(CRUD_NAMES.clusterPreferenceExample, 50);

    await apiClient.deleteVirtualMachineClusterPreference(name);
    await expect
      .poll(() => apiClient.virtualMachineClusterPreferenceExists(name), {
        message: `pre-test cleanup: preference ${name} should be absent`,
      })
      .toBe(false);

    await preferencesPage.goToClusterList();
    await preferencesPage.createFromYaml(virtualMachineClusterPreferenceImportYaml({ name }));
    await expect(preferencesPage.resourceTitle()).toContainText(name, {
      timeout: TestTimeouts.RESOURCE_CREATION,
    });

    await preferencesPage.goToClusterList();
    await preferencesPage.deleteFromList(name);
    await expect
      .poll(() => apiClient.virtualMachineClusterPreferenceExists(name), {
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
  });
});

test.describe(`Cluster preferences UI delete ${ROUTE_PREFERENCES_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Delete ClusterPreference from list in UI', async ({ apiClient, preferencesPage }) => {
    const name = generateNameWithBase(`${CRUD_NAMES.clusterPreferenceExample}-del`, 50);

    await apiClient.deleteVirtualMachineClusterPreference(name);
    await apiClient.applyVirtualMachineClusterPreferenceExample(name);
    await expect
      .poll(() => apiClient.virtualMachineClusterPreferenceExists(name), {
        timeout: TestTimeouts.RESOURCE_CREATION,
      })
      .toBe(true);

    await preferencesPage.goToClusterList();
    await preferencesPage.deleteFromList(name);
    await expect
      .poll(() => apiClient.virtualMachineClusterPreferenceExists(name), {
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
  });
});
