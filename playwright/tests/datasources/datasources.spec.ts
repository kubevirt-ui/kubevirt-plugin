import { ADMIN_ONLY_TAG, GATING_TAG } from '@/data-models/allure-constants';
import { ROUTE_DATASOURCES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/datasources-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { dataSourceImportYaml } from '@/utils/manifests';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

import './datasources.crud.suite';

test.describe(`DataSources read ${ROUTE_DATASOURCES_TAG} ${GATING_TAG}`, () => {
  test('Cluster OS DataSources are listed', async ({ dataSourcesPage: ds, nav }) => {
    await nav.goToDataSources();
    await ds.goToList();
    await expect(ds.row('rhel9')).toBeVisible();
    await expect(ds.row('fedora')).toBeVisible();
  });
});

test.describe(`DataSources cluster inventory ${ROUTE_DATASOURCES_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-9378) OS image DataSources are visible cluster-wide', async ({
    dataSourcesPage: ds,
    nav,
  }) => {
    await nav.goToDataSources();
    await ds.goToList();
    await expect(ds.row('rhel8')).toBeVisible();
    await expect(ds.row('centos-stream9')).toBeVisible();
    await ds.filterByName('rhel9');
    await expect(ds.row('rhel9')).toBeVisible();
  });
});

test.describe(`DataSources gating create from YAML ${ROUTE_DATASOURCES_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('ID(CNV-9372) Create DataSource with import YAML', async ({
    apiClient,
    dataSourcesPage: ds,
    testNamespace,
  }) => {
    const name = generateNameWithBase(`${CRUD_NAMES.dataSourceExample}-gating`, 50);

    await apiClient.deleteDataSource(name, testNamespace);
    await expect
      .poll(() => apiClient.dataSourceExists(name, testNamespace), {
        message: `pre-test cleanup: DataSource ${testNamespace}/${name} should be absent`,
      })
      .toBe(false);

    try {
      await ds.goToNamespaceList(testNamespace);
      await ds.dismissConsoleObstructions();
      await ds.createFromYaml(dataSourceImportYaml({ name, namespace: testNamespace }));
      await expect.poll(() => ds.currentUrl()).toMatch(ds.dataSourceDetailUrlPattern(name));
      await expect
        .poll(() => apiClient.dataSourceExists(name, testNamespace), {
          message: `DataSource ${testNamespace}/${name} should exist`,
          timeout: TestTimeouts.RESOURCE_CREATION,
        })
        .toBe(true);
      await ds.goToNamespaceList(testNamespace);
      await ds.filterByName(name);
      await expect(ds.nameLink(name)).toBeVisible({ timeout: TestTimeouts.LONG_OPERATION });
    } finally {
      await apiClient.deleteDataSource(name, testNamespace);
    }
  });
});
