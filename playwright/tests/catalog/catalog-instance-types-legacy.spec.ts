import { NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import { CATALOG_INSTANCE_TYPES_BOOT_VOLUME } from '@/utils/constants';

test.describe(`InstanceTypes legacy catalog entry ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Direct navigation to InstanceTypes tab URL loads bootable grid', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.goToInstanceTypesCatalog(testNamespace);
    await expect(catalogPage.instanceTypesCatalogTab()).toHaveAttribute('aria-selected', 'true');
    await expect(catalogPage.bootableVolumeSection()).toBeVisible();
  });
});

test.describe(`InstanceTypes legacy series affordances ${ROUTE_CATALOG_TAG} ${T2_TAG} ${NON_PRIV_TAG}`, () => {
  test('Fedora boot volume exposes M Series sizing', async ({ catalogPage, testNamespace }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.prepareInstanceTypesCatalogTab();
    const hasFedora = await catalogPage.selectBootableVolumeForInstanceTypesIfPresent(/fedora/i);
    if (!hasFedora) {
      await catalogPage.selectBootableVolumeForInstanceTypes(CATALOG_INSTANCE_TYPES_BOOT_VOLUME);
    }
    await catalogPage.selectInstanceTypeSeriesAndSize(/M Series/i);
    await expect(catalogPage.instanceTypeVmNameInput()).toBeVisible();
  });
});
