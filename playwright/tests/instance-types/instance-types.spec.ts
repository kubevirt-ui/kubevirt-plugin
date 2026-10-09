import { ADMIN_ONLY_TAG, GATING, GATING_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/instance-types-fixture';
import {
  createClusterInstanceTypeApi,
  createNamespacedInstanceTypeApi,
  IT_GROUP,
  IT_VERSION,
  verifyInstanceTypeDeletedCluster,
} from '@/utils/instance-type-test-helpers';
import { generateRandomInstanceTypeName } from '@/utils/random-data-generator';
import { ROUTE_INSTANCE_TYPES_TAG } from '@/data-models/route-tags';

const SUITE = 'InstanceType page';
const GATING_SUITE = 'Virtualization pages';
const RESOURCE_SUITE = 'Resource creation (gating)';

test.describe(SUITE, { tag: [ROUTE_INSTANCE_TYPES_TAG, T1_TAG, '@tier1-pages-it'] }, () => {
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
    test.setTimeout(utils.TestTimeouts.TEST_MEDIUM);

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

test.describe('Instance types page load', { tag: [ROUTE_INSTANCE_TYPES_TAG, GATING_TAG] }, () => {
  test('Instance Types page loads with Cluster and User tabs', async ({
    instanceTypesPage,
    utils,
  }) => {
    await utils.withAllure({ suite: GATING_SUITE, feature: GATING, tags: [GATING_TAG] });

    await instanceTypesPage.navigateToInstanceTypesViaUI();

    await test.step('Cluster InstanceTypes tab loads', async () => {
      const loaded = await instanceTypesPage.verifyInstanceTypesPageLoaded();
      expect.soft(loaded, 'Cluster InstanceTypes tab should be loaded').toBe(true);
    });

    await test.step('User InstanceTypes tab is navigable', async () => {
      await instanceTypesPage.clickUserInstanceTypesTab();
      const result = await instanceTypesPage.verifyUserInstanceTypesTabReady(
        utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
      );
      expect
        .soft(
          result.state === 'populated' || result.state === 'empty',
          'User InstanceTypes tab should render a list or empty state',
        )
        .toBe(true);
    });
  });
});

test.describe(
  'Instance type create via YAML',
  { tag: [ROUTE_INSTANCE_TYPES_TAG, GATING_TAG, '@resource-creation'] },
  () => {
    test('Create a cluster instance type via YAML editor', async ({
      apiClient,
      instanceTypesPage,
      utils,
    }) => {
      await utils.withAllure({ suite: RESOURCE_SUITE, feature: GATING, tags: [GATING_TAG] });

      const itName = utils.generateRandomInstanceTypeName('gating-it');
      const itYaml = [
        'apiVersion: instancetype.kubevirt.io/v1beta1',
        'kind: VirtualMachineClusterInstancetype',
        'metadata:',
        `  name: ${itName}`,
        '  labels:',
        '    app.kubernetes.io/managed-by: playwright-test',
        'spec:',
        '  cpu:',
        '    guest: 1',
        '  memory:',
        '    guest: 1Gi',
      ].join('\n');

      await instanceTypesPage.navigateToInstanceTypesViaUI();
      await instanceTypesPage.clickCreate();
      await instanceTypesPage.fillYamlEditorAndSave(itYaml);
      apiClient.trackResource('VirtualMachineClusterInstanceType', itName);

      await instanceTypesPage.navigateToInstanceTypesViaUI();
      await instanceTypesPage.filterByName(itName);
      const exists = await instanceTypesPage.verifyInstanceTypeExists(itName);
      expect(exists, `InstanceType ${itName} should be visible in the UI`).toBe(true);
    });
  },
);
