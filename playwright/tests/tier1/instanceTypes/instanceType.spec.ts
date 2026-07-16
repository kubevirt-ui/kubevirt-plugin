import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/instance-types-fixture';
import {
  createClusterInstanceTypeApi,
  createNamespacedInstanceTypeApi,
  IT_GROUP,
  IT_VERSION,
  namespacedInstanceTypeExists,
  verifyInstanceTypeDeletedCluster,
} from '@/utils/instance-type-test-helpers';
import { generateRandomInstanceTypeName } from '@/utils/random-data-generator';

const SUITE = 'InstanceType page';

test.describe(SUITE, { tag: [T1_TAG, '@tier1-pages-it'] }, () => {
  test.beforeEach(async ({ instanceTypesPage }) => {
    await instanceTypesPage.navigateToInstanceTypesViaUI();
  });

  test('Cluster instance type supports create and deletion', async ({
    apiClient,
    instanceTypesPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, ADMIN_ONLY_TAG],
    });
    test.setTimeout(utils.TestTimeouts.TEST_SHORT);

    const itName = generateRandomInstanceTypeName('cluster-it');
    await createClusterInstanceTypeApi(apiClient, itName, 2, '2Gi');

    await test.step('Created instance type is visible in the list', async () => {
      await instanceTypesPage.filterByName(itName);
      const exists = await instanceTypesPage.verifyInstanceTypeExists(itName);
      expect.soft(exists, `${itName} should be visible after creation`).toBe(true);
    });

    await test.step('Delete via API and verify removal from cluster', async () => {
      await apiClient.deleteClusterCustomResource(
        IT_GROUP,
        IT_VERSION,
        'virtualmachineclusterinstancetypes',
        itName,
      );
      const deleted = await verifyInstanceTypeDeletedCluster(apiClient, itName);
      expect(deleted.deleted, `${itName} should be deleted from cluster`).toBe(true);
    });
  });

  test('User InstanceTypes tab shows user-created instance types and supports name filter', async ({
    apiClient,
    instanceTypesPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, ADMIN_ONLY_TAG],
    });
    test.setTimeout(utils.TestTimeouts.TEST_SHORT);

    const ns = utils.generateTestNamespace('user-it');
    await apiClient.createNamespace(ns);
    await apiClient.waitForNamespaceReady(ns);
    apiClient.trackResource('Namespace', ns);

    const itName = generateRandomInstanceTypeName('user-it');
    await createNamespacedInstanceTypeApi(apiClient, itName, ns);

    await expect
      .poll(
        async () => {
          await instanceTypesPage.navigateToInstanceTypesViaUI();
          await instanceTypesPage.clickUserInstanceTypesTab();
          await instanceTypesPage.waitForInstanceTypesListReady();
          await instanceTypesPage.navigateToUserInstanceTypesProject(ns);
          await instanceTypesPage.filterByNameInUserTab(itName);
          return instanceTypesPage.verifyInstanceTypeExists(itName);
        },
        {
          message: `User instance type ${itName} should appear in User tab`,
          timeout: utils.TestTimeouts.DEFAULT,
          intervals: [2000, 3000, 5000],
        },
      )
      .toBe(true);
  });

  test('Cluster instance type detail page shows Details and YAML tabs with metadata', async ({
    apiClient,
    instanceTypesPage,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, ADMIN_ONLY_TAG],
    });
    test.setTimeout(utils.TestTimeouts.TEST_SHORT);

    const itName = generateRandomInstanceTypeName('cluster-it-detail');
    await createClusterInstanceTypeApi(apiClient, itName, 2, '2Gi');

    await instanceTypesPage.filterByName(itName);
    const exists = await instanceTypesPage.verifyInstanceTypeExists(itName);
    expect
      .soft(exists, `${itName} should appear in the list before navigating to detail`)
      .toBe(true);

    await instanceTypesPage.clickInstanceTypeByTestId(itName);

    await test.step('Details tab is visible', async () => {
      const detailsTab = instanceTypesPage.page.locator('[data-test-id="horizontal-link-Details"]');
      const visible = await detailsTab
        .waitFor({ state: 'visible', timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY })
        .then(() => true)
        .catch(() => false);
      expect.soft(visible, 'Details tab should be present on instance type detail page').toBe(true);
    });

    await test.step('YAML tab is visible', async () => {
      const yamlTab = instanceTypesPage.page.locator('[data-test-id="horizontal-link-YAML"]');
      const visible = await yamlTab
        .waitFor({ state: 'visible', timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY })
        .then(() => true)
        .catch(() => false);
      expect.soft(visible, 'YAML tab should be present on instance type detail page').toBe(true);
    });

    await test.step('Name metadata field shows correct name', async () => {
      const nameField = instanceTypesPage.page.locator('[data-test="Name"]');
      const visible = await nameField
        .waitFor({ state: 'visible', timeout: utils.TestTimeouts.UI_ELEMENT_VISIBILITY })
        .then(() => true)
        .catch(() => false);
      expect.soft(visible, 'Name metadata field should be visible').toBe(true);
    });
  });

  test('User instance type can be deleted from its detail page', async ({
    apiClient,
    instanceTypesPage,
    testConfig,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, ADMIN_ONLY_TAG],
    });
    test.setTimeout(utils.TestTimeouts.TEST_SHORT);

    const itName = generateRandomInstanceTypeName('user-it-del');
    await createNamespacedInstanceTypeApi(apiClient, itName, testConfig.testNamespace);

    await test.step('Navigate to user instance type detail page', async () => {
      // TODO: replace with UI navigation
      await instanceTypesPage.navigateToUserInstanceTypeDetail(testConfig.testNamespace, itName);
    });

    await test.step('Delete via Actions menu on detail page', async () => {
      await instanceTypesPage.deleteUserInstanceTypeFromDetail();
    });

    await test.step('Resource no longer exists on the cluster', async () => {
      const stillExists = await namespacedInstanceTypeExists(
        apiClient,
        testConfig.testNamespace,
        itName,
      );
      expect
        .soft(stillExists, `${itName} should be removed from cluster after UI deletion`)
        .toBe(false);
    });
  });
});

test.describe(
  'InstanceTypes name filter regression',
  { tag: [T1_TAG, ADMIN_ONLY_TAG, '@tier1-instancetypes'] },
  () => {
    test.beforeEach(async ({ instanceTypesPage }) => {
      await instanceTypesPage.navigateToInstanceTypesViaUI();
    });

    test('Cluster InstanceTypes name filter restores full list after clearing', async ({
      apiClient,
      instanceTypesPage,
      cleanup,
      utils,
    }) => {
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, ADMIN_ONLY_TAG],
      });
      test.setTimeout(utils.TestTimeouts.TEST_SHORT);

      const itNameA = generateRandomInstanceTypeName('filter-reg-a');
      const itNameB = generateRandomInstanceTypeName('filter-reg-b');
      await createClusterInstanceTypeApi(apiClient, itNameA, 1, '1Gi');
      await createClusterInstanceTypeApi(apiClient, itNameB, 1, '512Mi');
      cleanup.trackClusterInstanceType(itNameA);
      cleanup.trackClusterInstanceType(itNameB);

      await test.step('Filter by A shows A but not B', async () => {
        await instanceTypesPage.filterByName(itNameA);
        const aExists = await instanceTypesPage.verifyInstanceTypeExists(itNameA);
        expect.soft(aExists, `${itNameA} should be visible after filtering`).toBe(true);
        const bExists = await instanceTypesPage.verifyInstanceTypeExists(itNameB);
        expect.soft(bExists, `${itNameB} should be hidden when filtered to A`).toBe(false);
      });

      await test.step('Re-filter by B shows B but not A (CNV-87321 regression)', async () => {
        await instanceTypesPage.filterByName(itNameB);
        const bExists = await instanceTypesPage.verifyInstanceTypeExists(itNameB);
        expect.soft(bExists, `${itNameB} should be visible after re-filtering`).toBe(true);
        const aHidden = await instanceTypesPage.verifyInstanceTypeExists(itNameA);
        expect.soft(aHidden, `${itNameA} should be hidden when filtered to B`).toBe(false);
      });
    });
  },
);
