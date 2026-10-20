import { T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
test.describe(`Catalog filters ${ROUTE_CATALOG_TAG} ${T1_TAG}`, () => {
  test.beforeEach(async ({ catalogPage, testNamespace }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.dismissConsoleObstructions();
  });

  test('ID(CNV-8464) Filter VM catalog by OS name', async ({ catalogPage }) => {
    await catalogPage.filterByOsCheckbox('osName-RHEL', true);
    await expect(catalogPage.gridLinkWithText('Red Hat Enterprise Linux 9 VM')).toBeVisible();
    await expect(catalogPage.gridLinkWithText('Red Hat Enterprise Linux 8 VM')).toBeVisible();
    await expect(catalogPage.gridLinkWithText('Red Hat Enterprise Linux 7 VM')).toBeVisible();
    await catalogPage.filterByOsCheckbox('osName-RHEL', false);

    await catalogPage.filterByOsCheckbox('osName-Windows', true);
    await expect(catalogPage.gridLinkWithText('Microsoft Windows 10 VM')).toBeVisible();
    await expect(catalogPage.gridLinkWithText('Microsoft Windows Server 2012 R2 VM')).toBeVisible();
    await expect(catalogPage.gridLinkWithText('Microsoft Windows Server 2016 VM')).toBeVisible();
    await catalogPage.filterByOsCheckbox('osName-Windows', false);

    await catalogPage.filterByOsCheckbox('osName-Fedora', true);
    await expect(catalogPage.gridLinks()).toHaveCount(1);
    await catalogPage.filterByOsCheckbox('osName-Fedora', false);
  });

  test('ID(CNV-8467) Filter VM catalog by text', async ({ catalogPage }) => {
    await catalogPage.filterByText('Red Hat Enterprise Linux 9 VM');
    await expect(catalogPage.gridLinks()).toHaveCount(1);
  });
});

test.describe(`Catalog filter toolbar ${ROUTE_CATALOG_TAG} ${T2_TAG}`, () => {
  test('Catalog filter panel exposes OS and workload groups', async ({
    catalogPage,
    testNamespace,
  }) => {
    await catalogPage.openCatalogInNamespace(testNamespace);
    await catalogPage.dismissConsoleObstructions();
    await catalogPage.openCatalogFilterToolbar();
    await expect(catalogPage.catalogFilterOsNameOption()).toBeVisible();
    await expect(catalogPage.catalogFilterWorkloadOption()).toBeVisible();
  });
});
