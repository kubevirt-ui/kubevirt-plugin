import { GATING_TAG, NON_PRIV_TAG, T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import { DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES } from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`InstanceTypes catalog read ${ROUTE_CATALOG_TAG} ${GATING_TAG} ${NON_PRIV_TAG}`, () => {
  test('InstanceTypes tab lists bootable preferences', async ({ catalogPage, testNamespace }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.prepareInstanceTypesCatalogTab();
    await expect(
      catalogPage.instanceTypeRowMatching(/Red Hat Enterprise Linux|Fedora|CentOS/i),
    ).toBeVisible();
  });

  test('Boot volume step lists common OS images without developer preview label', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.openInstanceTypesBootVolumeCreationStep(testNamespace);
    await expect(catalogPage.bootableVolumeRowForInstanceTypes('rhel9')).toBeVisible({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await expect(catalogPage.instanceTypesDeveloperPreviewTooltipTrigger()).toHaveCount(0);
  });
});

test.describe(`InstanceTypes catalog UI ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('Switching between Template catalog and InstanceTypes tabs preserves catalog entry', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.waitForTemplateCatalogReady();
    await catalogPage.prepareInstanceTypesCatalogTab();
    await catalogPage.ensureTemplateCatalogTabSelected();
    await catalogPage.waitForTemplateCatalogReady();
    await expect(catalogPage.filterTextInput()).toBeVisible();
  });
});

test.describe(`InstanceTypes catalog filter ${ROUTE_CATALOG_TAG} ${T1_TAG} ${NON_PRIV_TAG}`, () => {
  test('InstanceTypes tab filter narrows bootable preference rows', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.prepareInstanceTypesCatalogTab();
    const search = catalogPage.instanceTypesBootVolumeSearchInput();
    await expect(search).toBeVisible({ timeout: TestTimeouts.LONG_OPERATION });
    await expect(catalogPage.instanceTypeRowMatching(/fedora/i)).toBeVisible();
    await catalogPage.filterInstanceTypesBootVolumesByText('rhel');
    await expect(
      catalogPage.instanceTypeRowMatching(/RHEL|Red Hat Enterprise Linux/i),
    ).toBeVisible();
    await expect(catalogPage.instanceTypeRowMatching(/fedora/i)).toBeHidden({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await expect(catalogPage.instanceTypeRowMatching(/centos-stream9/i)).toBeHidden({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  });
});

test.describe(`InstanceTypes catalog affordances ${ROUTE_CATALOG_TAG} ${T2_TAG} ${NON_PRIV_TAG}`, () => {
  test('InstanceTypes wizard shows series gallery and VM name field', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.prepareInstanceTypesCatalogTab();
    await catalogPage.selectBootableVolumeForInstanceTypes('rhel9');
    await expect(
      catalogPage.instanceTypeSeriesLabel(DEFAULT_RED_HAT_INSTANCE_TYPE_SERIES),
    ).toBeVisible();
    await expect(catalogPage.instanceTypeVmNameInput()).toBeVisible();
  });
});
