import {
  ADMIN_ONLY_TAG,
  GATING_TAG,
  NON_PRIV_TAG,
  T1_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { ROUTE_PREFERENCES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/preferences-fixture';
import type { NavigationPage } from '@/page-objects/navigation-page';
import type { PreferencesPage } from '@/page-objects/preferences-page';
import { CRUD_NAMES } from '@/utils/constants';
import { virtualMachineClusterPreferenceImportYaml } from '@/utils/manifests';
import { generateNameWithBase, generateRandomLabel } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

async function clusterPreferencesListIncludesCommonOs({
  nav,
  preferencesPage,
}: {
  nav: NavigationPage;
  preferencesPage: PreferencesPage;
}): Promise<void> {
  await nav.goToClusterPreferences();
  await preferencesPage.waitForClusterListReady();
  await expect(preferencesPage.row(/rhel|fedora|centos/i).first()).toBeVisible({
    timeout: TestTimeouts.LONG_OPERATION,
  });
}

test.describe(`Cluster preferences read ${ROUTE_PREFERENCES_TAG} ${GATING_TAG}`, () => {
  test(
    'Cluster preferences list includes common OS preferences',
    clusterPreferencesListIncludesCommonOs,
  );
});

test.describe(`Cluster preferences read ${ROUTE_PREFERENCES_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test(
    'Cluster preferences list includes common OS preferences',
    clusterPreferencesListIncludesCommonOs,
  );
});

test.describe(`Cluster preferences read ${ROUTE_PREFERENCES_TAG} ${T2_TAG} ${NON_PRIV_TAG}`, () => {
  test(
    'Cluster preferences list includes common OS preferences',
    clusterPreferencesListIncludesCommonOs,
  );
});

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

test.describe(`Cluster preferences UI update ${ROUTE_PREFERENCES_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
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
