import { GATING_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_CATALOG_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/catalog-fixture';
import {
  TEMPLATE_WIN10,
  TEMPLATE_WIN2K16,
  TEMPLATE_WIN2K19,
  TEMPLATE_WIN2K22,
} from '@/utils/constants';
test.describe(`Catalog filters ${ROUTE_CATALOG_TAG} ${GATING_TAG}`, () => {
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
    // common-templates removed Windows Server 2012 R2 (CNV-41784); unpinned CNV
    // no longer ships it, so assert the templates that still exist (aligned
    // with release-4.17 Cypress's cypress/tests/catalog/filter.spec.ts).
    await expect(catalogPage.gridLinkWithText(TEMPLATE_WIN10.name)).toBeVisible();
    await expect(catalogPage.gridLinkWithText(TEMPLATE_WIN2K16.name)).toBeVisible();
    await expect(catalogPage.gridLinkWithText(TEMPLATE_WIN2K19.name)).toBeVisible();
    await expect(catalogPage.gridLinkWithText(TEMPLATE_WIN2K22.name)).toBeVisible();
    await catalogPage.filterByOsCheckbox('osName-Windows', false);

    await catalogPage.filterByOsCheckbox('osName-Fedora', true);
    await expect(catalogPage.gridLinks()).toHaveCount(1);
    await catalogPage.filterByOsCheckbox('osName-Fedora', false);
  });

  test('ID(CNV-8467) Filter VM catalog by text', async ({ catalogPage }) => {
    await catalogPage.filterByText('Red Hat Enterprise Linux 9 VM');
    await expect(catalogPage.gridLinks()).toHaveCount(1);
  });

  test('ID(CNV-8465) Filter VM catalog by Workload', async ({ catalogPage }) => {
    await catalogPage.filterByOsCheckbox('workload-Desktop', true);
    await expect(catalogPage.gridLinkWithText(TEMPLATE_WIN10.name)).toBeVisible();
    await expect(catalogPage.gridLinkWithText(TEMPLATE_WIN2K19.name)).toBeHidden();
    await catalogPage.filterByOsCheckbox('workload-Desktop', false);
  });

  test('ID(CNV-8466) Filter VM catalog by OS and Workload', async ({ catalogPage }) => {
    await catalogPage.filterByOsCheckbox('osName-Windows', true);
    await catalogPage.filterByOsCheckbox('workload-Server', true);
    // See CNV-8464 above: Windows Server 2012 R2 is no longer shipped.
    await expect(catalogPage.gridLinkWithText(TEMPLATE_WIN2K16.name)).toBeVisible();
    await expect(catalogPage.gridLinkWithText(TEMPLATE_WIN2K19.name)).toBeVisible();
    await expect(catalogPage.gridLinkWithText(TEMPLATE_WIN2K22.name)).toBeVisible();
    await catalogPage.filterByOsCheckbox('workload-Server', false);

    await catalogPage.filterByOsCheckbox('workload-Desktop', true);
    await expect(catalogPage.gridLinkWithText(TEMPLATE_WIN10.name)).toBeVisible();
    await catalogPage.filterByOsCheckbox('workload-Desktop', false);
    await catalogPage.filterByOsCheckbox('osName-Windows', false);
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
