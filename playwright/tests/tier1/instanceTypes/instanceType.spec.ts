import { ADMIN_ONLY_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/instance-types-fixture';
import {
  createClusterInstanceTypeApi,
  createNamespacedInstanceTypeApi,
  IT_GROUP,
  IT_VERSION,
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
      await expect
        .poll(
          async () => {
            await instanceTypesPage.navigateToInstanceTypesViaUI();
            await instanceTypesPage.filterByName(itName);
            return instanceTypesPage.verifyInstanceTypeExists(itName);
          },
          {
            message: `${itName} should be visible after creation`,
            timeout: utils.TestTimeouts.DEFAULT,
            intervals: [2000, 3000, 5000],
          },
        )
        .toBe(true);
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
});
