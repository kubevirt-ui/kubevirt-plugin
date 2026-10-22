import type RequestContextClient from '@/clients/request-context-client';
import {
  ADMIN_ONLY_TAG,
  GATING_TAG,
  NON_PRIV_TAG,
  T1_TAG,
  T2_TAG,
} from '@/data-models/allure-constants';
import { ROUTE_BOOTABLE_VOLUMES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/bootable-volumes-fixture';
import type { BootableVolumesPage } from '@/page-objects/bootable-volumes-page';
import type { NavigationPage } from '@/page-objects/navigation-page';
import { ConsoleRoutes } from '@/utils/console-routes';
import { CRUD_NAMES, DATASOURCE_FORM } from '@/utils/constants';
import { verifyDataSourceCreated } from '@/utils/creation-verification';
import { generateNameWithBase, generateRandomLabel } from '@/utils/random-data-generator';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

async function cleanupDataSource(
  apiClient: RequestContextClient,
  name: string,
  namespace: string,
): Promise<void> {
  await apiClient.deleteDataSource(name, namespace);
  await expect
    .poll(() => apiClient.dataSourceExists(name, namespace), {
      message: `pre-test cleanup: DataSource ${namespace}/${name} should be absent`,
    })
    .toBe(false);
}

async function createRegistryBootableVolumeFromForm(
  bootableVolumesPage: BootableVolumesPage,
  nav: NavigationPage,
  namespace: string,
  name: string,
): Promise<void> {
  await nav.goToBootableVolumes(namespace);
  await bootableVolumesPage.goToNamespaceList(namespace);
  await bootableVolumesPage.createFromRegistryForm({
    cronExpression: DATASOURCE_FORM.cron,
    preferenceName: 'fedora',
    registryUrl: DATASOURCE_FORM.imageUrl,
    volumeName: name,
  });
}

async function bootableVolumesListLoadsInProject({
  bootableVolumesPage,
  nav,
  testNamespace,
}: {
  bootableVolumesPage: BootableVolumesPage;
  nav: NavigationPage;
  testNamespace: string;
}): Promise<void> {
  await nav.goToBootableVolumes(testNamespace);
  await bootableVolumesPage.goToNamespaceList(testNamespace);
  await expect(bootableVolumesPage.listTitle()).toBeVisible({
    timeout: TestTimeouts.LONG_OPERATION,
  });
}

test.describe(`Bootable volumes read ${ROUTE_BOOTABLE_VOLUMES_TAG} ${GATING_TAG}`, () => {
  test('Bootable volumes list loads in project', bootableVolumesListLoadsInProject);
});

test.describe(`Bootable volumes read ${ROUTE_BOOTABLE_VOLUMES_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Bootable volumes list loads in project', bootableVolumesListLoadsInProject);
});

test.describe(`Bootable volumes read ${ROUTE_BOOTABLE_VOLUMES_TAG} ${T2_TAG} ${NON_PRIV_TAG}`, () => {
  test('Bootable volumes list loads in project', bootableVolumesListLoadsInProject);
});

test.describe(`Bootable volumes gating create ${ROUTE_BOOTABLE_VOLUMES_TAG} ${GATING_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Add volume With YAML opens DataVolume create', async ({
    bootableVolumesPage,
    nav,
    testNamespace,
  }) => {
    await nav.goToBootableVolumes(testNamespace);
    await bootableVolumesPage.goToNamespaceList(testNamespace);
    await expect(bootableVolumesPage.addVolumeButton()).toBeVisible();
    await bootableVolumesPage.openCreateWithYaml(testNamespace);
    await expect(bootableVolumesPage.dataVolumeYamlCreateHeading()).toBeVisible({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });

  test('Add volume With form creates bootable volume from registry', async ({
    apiClient,
    bootableVolumesPage,
    nav,
    testNamespace,
  }) => {
    const name = generateNameWithBase(`${CRUD_NAMES.dataSourceForm}-bv-gating`, 50);

    await cleanupDataSource(apiClient, name, testNamespace);

    try {
      await createRegistryBootableVolumeFromForm(bootableVolumesPage, nav, testNamespace, name);
      await expect
        .poll(() => apiClient.dataSourceExists(name, testNamespace), {
          message: `DataSource ${testNamespace}/${name} should exist after form save`,
          timeout: TestTimeouts.RESOURCE_CREATION,
        })
        .toBe(true);
      await bootableVolumesPage.page.goto(
        `${ConsoleRoutes.dataSourcesInNamespace(testNamespace)}/${name}`,
        { waitUntil: 'domcontentloaded' },
      );
      await expect(
        bootableVolumesPage.page
          .locator('[data-test-id="resource-title"]')
          .filter({ hasText: name }),
      ).toBeVisible({ timeout: TestTimeouts.LONG_OPERATION });
    } finally {
      await apiClient.deleteDataSource(name, testNamespace);
    }
  });
});

test.describe(`Bootable volumes metadata ${ROUTE_BOOTABLE_VOLUMES_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Edit DataSource labels after Add volume With form', async ({
    apiClient,
    bootableVolumesPage,
    dataSourcesPage: ds,
    nav,
    testNamespace,
  }) => {
    const name = generateNameWithBase(`${CRUD_NAMES.dataSourceForm}-bv-edit`, 50);
    const label = generateRandomLabel('bv');

    await cleanupDataSource(apiClient, name, testNamespace);

    try {
      await createRegistryBootableVolumeFromForm(bootableVolumesPage, nav, testNamespace, name);
      await verifyDataSourceCreated(apiClient, ds, testNamespace, name);
      await ds.openDetail(testNamespace, name);
      await ds.editLabels(name, label);
      await expect(ds.labelOnDetail(label)).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      await apiClient.deleteDataSource(name, testNamespace);
    }
  });
});

test.describe(`Bootable volumes form create ${ROUTE_BOOTABLE_VOLUMES_TAG} ${T1_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Add volume With form creates registry import visible on DataSources list', async ({
    apiClient,
    bootableVolumesPage,
    dataSourcesPage: ds,
    nav,
    testNamespace,
  }) => {
    const name = generateNameWithBase(`${CRUD_NAMES.dataSourceForm}-bv-t1`, 50);

    await cleanupDataSource(apiClient, name, testNamespace);

    try {
      await createRegistryBootableVolumeFromForm(bootableVolumesPage, nav, testNamespace, name);
      await verifyDataSourceCreated(apiClient, ds, testNamespace, name);
    } finally {
      await apiClient.deleteDataSource(name, testNamespace);
    }
  });
});

test.describe(`Bootable volumes form create and delete ${ROUTE_BOOTABLE_VOLUMES_TAG} ${T2_TAG} ${ADMIN_ONLY_TAG}`, () => {
  test('Add volume With form creates registry import and deletes from DataSources list', async ({
    apiClient,
    bootableVolumesPage,
    dataSourcesPage: ds,
    nav,
    testNamespace,
  }) => {
    const name = generateNameWithBase(`${CRUD_NAMES.dataSourceForm}-bv-t2`, 50);

    await cleanupDataSource(apiClient, name, testNamespace);

    await createRegistryBootableVolumeFromForm(bootableVolumesPage, nav, testNamespace, name);
    await verifyDataSourceCreated(apiClient, ds, testNamespace, name);
    await ds.deleteFromList(name);
    await expect
      .poll(() => apiClient.dataSourceExists(name, testNamespace), {
        message: `DataSource ${testNamespace}/${name} should be deleted`,
        timeout: TestTimeouts.LONG_OPERATION,
      })
      .toBe(false);
    await ds.goToNamespaceList(testNamespace);
    await ds.filterByName(name);
    await expect(ds.nameLink(name)).toBeHidden({ timeout: 5 * MINUTE });
  });
});
